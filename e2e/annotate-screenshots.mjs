/**
 * Annotate screenshots with red highlight boxes + instruction labels.
 * Uses sharp (SVG overlay) instead of ImageMagick.
 * Coordinates from Playwright getBoundingBox() via get-coords.mjs.
 */
import sharp from "sharp";
import { mkdirSync, cpSync } from "fs";

const SRC = "e2e/screenshots";
const OUT = "e2e/screenshots/annotated";
mkdirSync(OUT, { recursive: true });

/** Draw red rounded-rect boxes and red text labels on an image. */
async function annotate(filename, elements) {
  const src = `${SRC}/${filename}`;
  const dst = `${OUT}/${filename}`;

  const img = sharp(src);
  const { width, height } = await img.metadata();

  // Build SVG overlay
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  for (const el of elements) {
    if (el.type === "box") {
      const sw = el.thick ? 4 : 3;
      svg += `<rect x="${el.x1}" y="${el.y1}" width="${el.x2 - el.x1}" height="${el.y2 - el.y1}" rx="10" ry="10" fill="none" stroke="red" stroke-width="${sw}"/>`;
    } else if (el.type === "label") {
      const size = el.small ? 16 : 20;
      // Escape XML special chars
      const text = el.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      svg += `<text x="${el.x}" y="${el.y}" font-family="Arial, sans-serif" font-size="${size}" fill="red" font-weight="bold">${text}</text>`;
    }
  }
  svg += "</svg>";

  await img
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(dst);

  console.log(`  ${filename}`);
}

// 01 - My Apps: "Connect Wallet" button
await annotate("01-my-apps-disconnected.png", [
  { type: "box", x1: 1112, y1: 8, x2: 1284, y2: 56, thick: true },
  { type: "label", x: 1050, y: 85, text: 'Click "Connect Wallet"' },
]);

// 02 - Register App form: timelock presets + Register App button
await annotate("02-register-app-form.png", [
  { type: "box", x1: 485, y1: 262, x2: 931, y2: 294 },
  { type: "label", x: 940, y: 284, text: "1. Pick a timelock", small: true },
  { type: "box", x1: 485, y1: 388, x2: 614, y2: 432, thick: true },
  { type: "label", x: 624, y: 418, text: '2. Click "Register App"', small: true },
]);

// 03 - Timelock selected: "Register App" button
await annotate("03-register-app-timelock-selected.png", [
  { type: "box", x1: 485, y1: 388, x2: 614, y2: 432, thick: true },
  { type: "label", x: 624, y: 418, text: 'Click "Register App"' },
]);

// 04 - App Settings: "Manage Scores" button
await annotate("04-app-settings.png", [
  { type: "box", x1: 405, y1: 535, x2: 568, y2: 579, thick: true },
  { type: "label", x: 410, y: 620, text: 'Click "Manage Scores"' },
]);

// 05 - Deploy Scorer: "Deploy New Scorer" button
await annotate("05-deploy-scorer.png", [
  { type: "box", x1: 485, y1: 394, x2: 658, y2: 438, thick: true },
  { type: "label", x: 668, y: 425, text: 'Click "Deploy New Scorer"' },
]);

// 06 - Manage Scores: first 3 score inputs + Save button
await annotate("06-manage-scores.png", [
  { type: "box", x1: 944, y1: 264, x2: 1048, y2: 302 },
  { type: "box", x1: 944, y1: 315, x2: 1048, y2: 353 },
  { type: "box", x1: 944, y1: 366, x2: 1048, y2: 404 },
  { type: "label", x: 1058, y: 290, text: "1. Enter custom scores", small: true },
  { type: "box", x1: 268, y1: 1043, x2: 418, y2: 1087, thick: true },
  { type: "label", x: 268, y: 1035, text: '2. Click "Save"', small: true },
]);

// 07 - Score Explorer: reference only (no annotations)
// Just copy the file
cpSync(`${SRC}/07-score-explorer.png`, `${OUT}/07-score-explorer.png`);
console.log("  07-score-explorer.png (no annotations)");

// 08 - Demo page: BringID modal
await annotate("08-demo-page.png", [
  { type: "box", x1: 510, y1: 185, x2: 870, y2: 700, thick: true },
  { type: "label", x: 510, y: 720, text: "BringID verification modal", small: true },
]);

console.log("\nAll annotated screenshots in e2e/screenshots/annotated/");
