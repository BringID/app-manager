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
const SCORER_ADDRESS = results.scorerAddress;

console.log(`App ID: ${APP_ID}, Scorer: ${SCORER_ADDRESS}\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const page = await context.newPage();

async function shot(name, description) {
  await page.waitForTimeout(1500); // let animations settle
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 ${name}: ${description}`);
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

// ── 4. App Settings page ──
await page.goto(`${BASE_URL}/apps/${APP_ID}`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(3000); // wait for on-chain data to load
await shot("04-app-settings", "App Settings page showing status and scorer");

// ── 5. Deploy Custom Scorer page ──
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/deploy`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2000);
await shot("05-deploy-scorer", "Deploy Custom Scorer - 3-step wizard");

// ── 6. Manage Scores page ──
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/manage`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(3000);
await shot("06-manage-scores", "Manage Custom Scores page with score table");

// ── 7. Score Explorer page ──
await page.goto(`${BASE_URL}/scores`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2000);
await shot("07-score-explorer", "Score Explorer - all credential groups");

// ── 8. Demo page ──
await page.goto(`${BASE_URL}/demo?appId=${APP_ID}`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2000);
await shot("08-demo-page", "Demo page with SDK integration");

await browser.close();
console.log("\n✓ All screenshots saved to e2e/screenshots/");
