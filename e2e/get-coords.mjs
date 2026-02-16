/**
 * Get exact bounding boxes of clickable elements for annotation.
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "fs";

const BASE_URL = "http://localhost:3000";
const results = JSON.parse(
  readFileSync(new URL("./flow-results.json", import.meta.url), "utf8")
);
const APP_ID = results.appId;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const page = await context.newPage();

async function getBBox(locator) {
  const box = await locator.boundingBox();
  if (!box) return null;
  // Add padding
  const p = 4;
  return {
    x1: Math.round(box.x - p),
    y1: Math.round(box.y - p),
    x2: Math.round(box.x + box.width + p),
    y2: Math.round(box.y + box.height + p),
  };
}

// 01 - Connect Wallet button
await page.goto(`${BASE_URL}/apps`);
await page.waitForLoadState("networkidle");
let b = await getBBox(page.getByTestId("rk-connect-button"));
console.log(`01 Connect Wallet: ${JSON.stringify(b)}`);

// 02 - Register App form
await page.goto(`${BASE_URL}/apps/new`);
await page.waitForLoadState("networkidle");
// Timelock preset row (all preset buttons)
const presets = page.locator("button", { hasText: /^(1 day|1 week|1 month|3 months|6 months|1 year|Disabled)$/ });
const firstPreset = await getBBox(presets.first());
const lastPreset = await getBBox(presets.nth(5)); // "1 year"
console.log(`02 Timelock presets row: x1=${firstPreset.x1} y1=${firstPreset.y1} x2=${lastPreset.x2} y2=${lastPreset.y2}`);
b = await getBBox(page.getByRole("button", { name: "Register App" }));
console.log(`02/03 Register App btn: ${JSON.stringify(b)}`);

// 05 - Deploy Scorer
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/deploy`);
await page.waitForLoadState("networkidle");
b = await getBBox(page.getByRole("button", { name: "Deploy New Scorer" }));
console.log(`05 Deploy New Scorer btn: ${JSON.stringify(b)}`);

// 06 - Manage Scores
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/manage`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(3000);
const scoreInputs = page.locator('input[type="number"]');
const count = await scoreInputs.count();
console.log(`06 Score input count: ${count}`);
for (let i = 0; i < Math.min(3, count); i++) {
  b = await getBBox(scoreInputs.nth(i));
  console.log(`06 Score input ${i}: ${JSON.stringify(b)}`);
}
b = await getBBox(page.getByRole("button", { name: /Save.*Score/ }));
console.log(`06 Save btn: ${JSON.stringify(b)}`);

// 08 - Demo page
await page.goto(`${BASE_URL}/demo?appId=${APP_ID}`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2000);
b = await getBBox(page.getByRole("button", { name: "Get Score" }));
console.log(`08 Get Score btn: ${JSON.stringify(b)}`);

await browser.close();
