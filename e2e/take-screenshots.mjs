/**
 * Playwright script to take screenshots of all key UI pages.
 * Run AFTER onchain-flow.mjs has created the app and scorer.
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "fs";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = "e2e/screenshots";

// Read results from on-chain flow
const results = JSON.parse(
  readFileSync(new URL("./flow-results.json", import.meta.url), "utf8")
);
const APP_ID = results.appId;
const APP_ID_HEX = "0x" + BigInt(APP_ID).toString(16).padStart(64, "0");
const SCORER_ADDRESS = results.scorerAddress;

// Read secrets from .env.local
const envLocal = readFileSync(".env.local", "utf8");
const E2E_KEY = envLocal.match(/E2E_PRIVATE_KEY=(.*)/)?.[1]?.trim();
const ALCHEMY_KEY = envLocal.match(/NEXT_PUBLIC_ALCHEMY_API_KEY=(.*)/)?.[1]?.trim();

console.log(`App ID: ${APP_ID}, Scorer: ${SCORER_ADDRESS}\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const page = await context.newPage();
page.setDefaultNavigationTimeout(60000);

async function shot(name, description, targetPage = page) {
  await targetPage.waitForTimeout(1500); // let animations settle
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await targetPage.screenshot({ path, fullPage: true });
  console.log(`📸 ${name}: ${description}`);
}

/** Wait for on-chain content to appear, retrying with page reload if needed. */
async function waitForContent(
  locator,
  { retries = 3, timeout = 45000, targetPage: tp = page } = {}
) {
  for (let i = 0; i < retries; i++) {
    try {
      await locator.waitFor({ timeout });
      return;
    } catch {
      if (i < retries - 1) {
        console.log(`  ↻ Retrying (on-chain data not loaded yet)...`);
        await tp.reload();
        await tp.waitForLoadState("networkidle");
      } else {
        throw new Error(`Content not found after ${retries} attempts`);
      }
    }
  }
}

// ── 1. My Apps page (disconnected) ──
await page.goto(`${BASE_URL}/apps`);
await page.waitForLoadState("networkidle");
await shot("01-my-apps-disconnected", "My Apps page before wallet connection");

// ── 2. Register App page (form) — cropped to form card only ──
await page.goto(`${BASE_URL}/apps/new`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1500);
{
  const box = await page.locator(".max-w-lg > div").boundingBox();
  const pad = 24;
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/02-register-app-form.png`,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
}
console.log("📸 02-register-app-form: Register App form with timelock options");

// ── 3. Register App - with 1 day timelock selected ──
await page.click("text=1 day");
await shot(
  "03-register-app-timelock-selected",
  "Register App with 1 day timelock selected"
);

// ── 4. App Settings page (uses hex app ID in URL, chainId for Base Sepolia) ──
await page.goto(`${BASE_URL}/apps/${APP_ID_HEX}?chainId=84532`);
await page.waitForLoadState("networkidle");
await waitForContent(page.locator("text=/Active|Suspended/").first());
await shot("04-app-settings", "App Settings page showing status and scorer");

// ── 5. Deploy Custom Scorer page ──
await page.goto(`${BASE_URL}/apps/${APP_ID_HEX}/scorer/deploy?chainId=84532`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2000);
await shot("05-deploy-scorer", "Deploy Custom Scorer - 3-step wizard");

// ── 6. Manage Scores page ──
await page.goto(`${BASE_URL}/apps/${APP_ID_HEX}/scorer/manage?chainId=84532`);
await page.waitForLoadState("networkidle");
await waitForContent(page.locator("text=Farcaster").first());
await shot("06-manage-scores", "Manage Custom Scores page with score table");

// ── 7. Score Explorer page ──
await page.goto(`${BASE_URL}/scores?chainId=84532`);
await page.waitForLoadState("networkidle");
await waitForContent(page.locator("text=Farcaster").first());
await shot("07-score-explorer", "Score Explorer - all credential groups");

// ── 8. Demo page (with wallet via ethers) ──
await page.goto(
  `${BASE_URL}/demo/e2e?appId=${APP_ID_HEX}&key=${E2E_KEY}`
);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(5000);

// Click Verify Humanity to open modal
await page.click("text=Verify Humanity");
await page.waitForTimeout(3000);

// If first time, need to create BringID key (triggers ethers signature)
const iframe = page.frameLocator("iframe").first();
const createKeyBtn = iframe.locator("text=Create BringID key");
if (await createKeyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await createKeyBtn.click();
  await page.waitForTimeout(15000); // wait for key creation + verification list
}

// Wait for credential list to load in the widget
await page.waitForTimeout(8000);

await shot("08-demo-page", "Demo page with BringID verification modal");

// Close the first browser before starting wallet-connected screenshots
await context.close();
await browser.close();

// ── 9. Wallet-connected screenshots (register app + admin settings) ──
console.log("\n=== Wallet-connected screenshots ===\n");

const account = privateKeyToAccount(E2E_KEY);
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
});
console.log(`E2E wallet: ${account.address}`);

// Helper: set up a fresh page with mock wallet init scripts
const MOCK_WALLET_PATH = new URL("./mock-wallet-init.js", import.meta.url).pathname;

async function setupWalletPage(ctx) {
  const p = await ctx.newPage();
  p.setDefaultNavigationTimeout(60000);
  p.on("pageerror", (err) => console.log("  PAGE ERROR:", err.message));

  await p.exposeFunction("__e2e_sendTransaction", async (tx) => {
    console.log(`  → eth_sendTransaction: to=${tx.to} data=${tx.data?.slice(0, 10)}...`);
    const hash = await walletClient.sendTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value ? BigInt(tx.value) : undefined,
    });
    console.log(`  → tx hash: ${hash}`);
    return hash;
  });

  await p.addInitScript(`
    window.__E2E_ADDRESS__ = "${account.address}";
    window.__E2E_ALCHEMY_RPC__ = "https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}";
  `);
  await p.addInitScript({ path: MOCK_WALLET_PATH });
  return p;
}

// Use a fresh browser to avoid shared state from earlier screenshots
const walletBrowser = await chromium.launch({ headless: true });
const walletContext = await walletBrowser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});

// Navigate and connect wallet (retry with fresh page on failure)
let walletPage;
for (let attempt = 1; attempt <= 3; attempt++) {
  const p = await setupWalletPage(walletContext);
  await p.goto(`${BASE_URL}/apps/new?chainId=84532`);
  await p.waitForLoadState("networkidle");
  await p.waitForTimeout(2000);

  console.log(`Connecting wallet (attempt ${attempt})...`);
  const connectBtn = p.locator('[data-testid="rk-connect-button"]');
  const visible = await connectBtn.isVisible({ timeout: 10000 }).catch(() => false);
  if (!visible) {
    console.log("  Connect button not found, retrying with fresh page...");
    await p.close();
    continue;
  }
  await connectBtn.click();
  await p.waitForTimeout(1000);
  await p.locator('[data-testid="rk-wallet-option-dev.e2e.wallet"]').click();
  await p.waitForTimeout(3000);
  console.log("Wallet connected");
  walletPage = p;
  break;
}
if (!walletPage) throw new Error("Failed to connect wallet after 3 attempts");

// Select 1 day timelock
await walletPage.click("text=1 day");
await walletPage.waitForTimeout(500);

// Register the app
console.log("Registering app (on-chain transaction)...");
// Use button selector to avoid clicking the nav link with the same text
await walletPage.locator('button:has-text("Create App")').click();
await walletPage.locator("text=App Registered!").waitFor({ timeout: 120000 });
console.log("App registered!");

// ── 03b: Registration success banner — cropped to banner only ──
await walletPage.waitForTimeout(1500);
{
  const box = await walletPage.locator(".max-w-lg > div").boundingBox();
  const pad = 24;
  await walletPage.screenshot({
    path: `${SCREENSHOT_DIR}/03b-register-app-success.png`,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
}
console.log("📸 03b-register-app-success: Registration success banner with new App ID");

// Extract new app ID from "Go to App Settings" link
const settingsLink = walletPage.locator('a:has-text("Go to App Settings")');
const href = await settingsLink.getAttribute("href");
const newAppIdHex = href.match(/\/apps\/(0x[0-9a-f]+)/i)?.[1];
console.log(`New app: ${newAppIdHex}`);

// ── 04b: App settings page as admin ──
await walletPage.goto(`${BASE_URL}/apps/${newAppIdHex}?chainId=84532`);
await walletPage.waitForLoadState("networkidle");
await waitForContent(walletPage.locator("text=/Active|Suspended/").first(), {
  targetPage: walletPage,
});
await shot(
  "04b-app-settings-admin",
  "App settings page with admin controls",
  walletPage
);

await walletContext.close();
await walletBrowser.close();
console.log("\n✓ All screenshots saved to e2e/screenshots/");
