/**
 * Record a video walkthrough of the App Manager UI.
 * Uses Playwright's built-in video recording.
 * Injects step labels and click circle indicators for clarity.
 */
import { chromium } from "@playwright/test";
import { readFileSync, renameSync } from "fs";

const BASE_URL = "http://localhost:3000";
const VIDEO_DIR = "e2e/videos";

const results = JSON.parse(
  readFileSync(new URL("./flow-results.json", import.meta.url), "utf8")
);
const APP_ID = results.appId;

// Read E2E private key from .env.local for demo page wallet
const E2E_KEY = readFileSync(".env.local", "utf8")
  .match(/E2E_PRIVATE_KEY=(.*)/)?.[1]
  ?.trim();

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

/** Inject or update the step label overlay at top-left. */
async function showStep(step, title) {
  await page.evaluate(({ step, title }) => {
    let el = document.getElementById("__step-label");
    if (!el) {
      el = document.createElement("div");
      el.id = "__step-label";
      Object.assign(el.style, {
        position: "fixed",
        top: "70px",
        left: "16px",
        zIndex: "999999",
        padding: "10px 20px",
        borderRadius: "10px",
        background: "rgba(0, 0, 0, 0.75)",
        border: "2px solid rgba(59, 130, 246, 0.6)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        fontWeight: "600",
        pointerEvents: "none",
        transition: "opacity 0.4s",
        opacity: "0",
      });
      document.body.appendChild(el);
    }
    el.innerHTML = `<span style="color:#60a5fa">Step ${step}</span>  ${title}`;
    el.style.opacity = "0";
    requestAnimationFrame(() => (el.style.opacity = "1"));
  }, { step, title });
  await pause(300);
}

/** Show a pulsing red circle at an element's center, pause, then click it. */
async function clickWithCircle(locator) {
  const box = await locator.boundingBox();
  if (!box) {
    await locator.click();
    return;
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // Inject circle
  await page.evaluate(({ cx, cy }) => {
    const ring = document.createElement("div");
    ring.id = "__click-circle";
    Object.assign(ring.style, {
      position: "fixed",
      left: `${cx - 24}px`,
      top: `${cy - 24}px`,
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      border: "3px solid red",
      pointerEvents: "none",
      zIndex: "999998",
      animation: "__click-pulse 0.8s ease-in-out infinite",
    });

    // Add keyframes if not already present
    if (!document.getElementById("__click-style")) {
      const style = document.createElement("style");
      style.id = "__click-style";
      style.textContent = `
        @keyframes __click-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(ring);
  }, { cx, cy });

  await pause(1200); // let the circle pulse visibly
  await locator.click();
  await pause(400);

  // Remove circle
  await page.evaluate(() => {
    document.getElementById("__click-circle")?.remove();
  });
}

// ── Scene 1: My Apps (disconnected) ──
console.log("Step 1: My Apps page");
await page.goto(`${BASE_URL}/apps`);
await page.waitForLoadState("networkidle");
await showStep(1, "My Apps");
await pause(2500);

// ── Scene 2: Navigate to Register App ──
console.log("Step 2: Register App form");
await showStep(2, "Register App");
await clickWithCircle(page.locator("nav >> text=Register App"));
await page.waitForLoadState("networkidle");
await pause(2000);

// Click through timelock presets to show interactivity
console.log("  - Clicking timelock presets...");
for (const preset of ["1 week", "1 month", "3 months", "1 day"]) {
  await clickWithCircle(page.locator(`text=${preset}`, { exact: true }));
  await pause(600);
}
await pause(1500);

// ── Scene 3: App Settings ──
console.log("Step 3: App Settings");
await showStep(3, "App Settings");
await page.goto(`${BASE_URL}/apps/${APP_ID}`);
await page.waitForLoadState("networkidle");
await pause(3000);

// ── Scene 4: Deploy Scorer wizard ──
console.log("Step 4: Deploy Scorer");
await showStep(4, "Deploy Custom Scorer");
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/deploy`);
await page.waitForLoadState("networkidle");
await pause(3000);

// ── Scene 5: Manage Scores ──
console.log("Step 5: Manage Scores");
await showStep(5, "Manage Scores");
await page.goto(`${BASE_URL}/apps/${APP_ID}/scorer/manage`);
await page.waitForLoadState("networkidle");
await pause(2000);

// Type some scores to show editability
console.log("  - Editing scores...");
const inputs = page.locator('input[type="number"]');
const count = await inputs.count();
if (count > 0) {
  await clickWithCircle(inputs.nth(0));
  await inputs.nth(0).fill("100");
  await pause(500);
  await clickWithCircle(inputs.nth(1));
  await inputs.nth(1).fill("200");
  await pause(500);
  await clickWithCircle(inputs.nth(2));
  await inputs.nth(2).fill("150");
  await pause(1500);

  // Reset
  const resetBtn = page.locator('text=Reset');
  if (await resetBtn.isVisible()) {
    await clickWithCircle(resetBtn);
    await pause(1000);
  }
}

// Scroll down to show full table
for (let i = 0; i < 4; i++) {
  await page.mouse.wheel(0, 200);
  await pause(500);
}
await pause(1500);

// ── Scene 6: Demo page (with wallet via ethers) ──
console.log("Step 6: SDK Demo");
await showStep(6, "SDK Demo");
await page.goto(
  `${BASE_URL}/demo/e2e?appId=${APP_ID}&key=${E2E_KEY}`
);
await page.waitForLoadState("networkidle");
await pause(3000);

// Click Verify Humanity to open BringID modal
console.log("  - Opening BringID verification modal...");
await clickWithCircle(page.locator("text=Verify Humanity"));
await pause(3000);

// If first time, create BringID key (triggers ethers signature)
const iframe = page.frameLocator("iframe").first();
const createKeyBtn = iframe.locator("text=Create BringID key");
if (await createKeyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  console.log("  - Creating BringID key...");
  await createKeyBtn.click();
  await pause(10000);
}

// Show the verification options in the modal
await pause(5000);

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
