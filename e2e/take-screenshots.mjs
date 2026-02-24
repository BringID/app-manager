/**
 * Playwright script to take screenshots of all key UI pages.
 * Run AFTER onchain-flow.mjs has created the app and scorer.
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "fs";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = "e2e/screenshots";

// Read results from on-chain flow
const results = JSON.parse(
  readFileSync(new URL("./flow-results.json", import.meta.url), "utf8")
);
const APP_ID = results.appId;
const APP_ID_HEX = "0x" + BigInt(APP_ID).toString(16).padStart(64, "0");
const SCORER_ADDRESS = results.scorerAddress;

// Read E2E private key from .env.local for demo page wallet
const E2E_KEY = readFileSync(".env.local", "utf8")
  .match(/E2E_PRIVATE_KEY=(.*)/)?.[1]
  ?.trim();

console.log(`App ID: ${APP_ID}, Scorer: ${SCORER_ADDRESS}\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const page = await context.newPage();
page.setDefaultNavigationTimeout(60000);

async function shot(name, description) {
  await page.waitForTimeout(1500); // let animations settle
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 ${name}: ${description}`);
}

/** Wait for on-chain content to appear, retrying with page reload if needed. */
async function waitForContent(locator, { retries = 3, timeout = 45000 } = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      await locator.waitFor({ timeout });
      return;
    } catch {
      if (i < retries - 1) {
        console.log(`  ↻ Retrying (on-chain data not loaded yet)...`);
        await page.reload();
        await page.waitForLoadState("networkidle");
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

// ── 2. Register App page (form) ──
await page.goto(`${BASE_URL}/apps/new`);
await page.waitForLoadState("networkidle");
await shot("02-register-app-form", "Register App form with timelock options");

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

await browser.close();
console.log("\n✓ All screenshots saved to e2e/screenshots/");
