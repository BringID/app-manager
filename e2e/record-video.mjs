/**
 * Record a video walkthrough of the App Manager UI.
 * Uses Playwright's built-in video recording.
 */
import { chromium } from "@playwright/test";
import { readFileSync, renameSync } from "fs";

const BASE_URL = "http://localhost:3000";
const VIDEO_DIR = "e2e/videos";

const results = JSON.parse(
  readFileSync(new URL("./flow-results.json", import.meta.url), "utf8")
);
const APP_ID = results.appId;

console.log(`Recording walkthrough for App #${APP_ID}...\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
  recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

async function pause(ms = 2000) {
  await page.waitForTimeout(ms);
}

// ── Scene 1: My Apps (disconnected) ──
console.log("Scene 1: My Apps page");
await page.goto(`${BASE_URL}/apps`);
await page.waitForLoadState("networkidle");
await pause(2500);

// ── Scene 2: Navigate to Register App ──
console.log("Scene 2: Register App form");
await page.click('text=Register App');
await page.waitForLoadState("networkidle");
await pause(2000);

// Click through timelock presets to show interactivity
console.log("  - Clicking timelock presets...");
for (const preset of ["1 week", "1 month", "3 months", "1 day"]) {
  await page.click(`text=${preset}`, { exact: true });
  await pause(800);
}
await pause(1500);

// ── Scene 3: Score Explorer ──
console.log("Scene 3: Score Explorer");
await page.click('text=Score Explorer');
await page.waitForLoadState("networkidle");
await pause(2000);

// Scroll down slowly to show all credential groups
console.log("  - Scrolling through scores...");
for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, 200);
  await pause(600);
}
await pause(1500);

// Scroll back up
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await pause(1500);

// ── Scene 4: App Settings ──
console.log("Scene 4: App Settings");
await page.goto(`${BASE_URL}/apps/${APP_ID}`);
await page.waitForLoadState("networkidle");
await pause(3000);

// ── Scene 5: Deploy Scorer wizard ──
console.log("Scene 5: Deploy Scorer wizard");
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/deploy`);
await page.waitForLoadState("networkidle");
await pause(3000);

// ── Scene 6: Manage Scores ──
console.log("Scene 6: Manage Scores");
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/manage`);
await page.waitForLoadState("networkidle");
await pause(2000);

// Type some scores to show editability
console.log("  - Editing scores...");
const inputs = page.locator('input[type="number"]');
const count = await inputs.count();
if (count > 0) {
  await inputs.nth(0).click();
  await inputs.nth(0).fill("100");
  await pause(500);
  await inputs.nth(1).click();
  await inputs.nth(1).fill("200");
  await pause(500);
  await inputs.nth(2).click();
  await inputs.nth(2).fill("150");
  await pause(1500);

  // Reset
  const resetBtn = page.locator('text=Reset');
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await pause(1000);
  }
}

// Scroll down to show full table
for (let i = 0; i < 4; i++) {
  await page.mouse.wheel(0, 200);
  await pause(500);
}
await pause(1500);

// ── Scene 7: Demo page ──
console.log("Scene 7: Demo page");
await page.goto(`${BASE_URL}/demo?appId=${APP_ID}`);
await page.waitForLoadState("networkidle");
await pause(2000);

// Scroll to show all sections
for (let i = 0; i < 3; i++) {
  await page.mouse.wheel(0, 250);
  await pause(600);
}
await pause(2000);

// ── Done ──
console.log("\nClosing browser...");
await page.close();
await context.close();
await browser.close();

// Rename the video file to something predictable
const { readdirSync } = await import("fs");
const files = readdirSync(VIDEO_DIR).filter((f) => f.endsWith(".webm"));
if (files.length > 0) {
  const latest = files.sort().pop();
  renameSync(`${VIDEO_DIR}/${latest}`, `${VIDEO_DIR}/walkthrough.webm`);
  console.log(`\nVideo saved to ${VIDEO_DIR}/walkthrough.webm`);
} else {
  console.log("\nWarning: No video file found.");
}
