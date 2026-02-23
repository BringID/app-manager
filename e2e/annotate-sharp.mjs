/**
 * Annotate screenshots with red highlight boxes + instruction labels using sharp.
 * Drop-in replacement for annotate-screenshots.sh when ImageMagick is unavailable.
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";

const SRC = "e2e/screenshots";
const OUT = "e2e/screenshots/annotated";
mkdirSync(OUT, { recursive: true });

/** Create an SVG overlay with rounded-rect boxes and text labels. */
function svgOverlay(width, height, elements) {
  const parts = elements.map((el) => {
    if (el.type === "box") {
      const { x, y, w, h, r = 10, stroke = 3 } = el;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="red" stroke-width="${stroke}"/>`;
    }
    if (el.type === "label") {
      const { x, y, text, size = 20 } = el;
      return `<text x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" fill="red" font-weight="bold">${text}</text>`;
    }
    return "";
  });

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${parts.join("")}</svg>`
  );
}

async function annotate(name, elements) {
  const src = `${SRC}/${name}.png`;
  const dst = `${OUT}/${name}.png`;
  const img = sharp(src);
  const { width, height } = await img.metadata();
  const overlay = svgOverlay(width, height, elements);
  await img.composite([{ input: overlay, top: 0, left: 0 }]).toFile(dst);
  console.log(`✅ ${name}`);
}

// 01 - My Apps: "Connect Wallet" button (top-right)
await annotate("01-my-apps-disconnected", [
  { type: "box", x: 1075, y: 12, w: 160, h: 42, r: 14, stroke: 4 },
  { type: "label", x: 990, y: 80, text: 'Click "Connect Wallet"' },
]);

// 02 - Register App form: timelock presets + Register App button
await annotate("02-register-app-form", [
  { type: "box", x: 475, y: 255, w: 420, h: 35, r: 10 },
  { type: "label", x: 905, y: 278, text: "1. Pick a timelock", size: 16 },
  { type: "box", x: 477, y: 380, w: 110, h: 35, r: 10, stroke: 4 },
  { type: "label", x: 597, y: 405, text: '2. Click "Register App"', size: 16 },
]);

// 03 - Timelock selected: "Register App" button
await annotate("03-register-app-timelock-selected", [
  { type: "box", x: 477, y: 380, w: 110, h: 35, r: 10, stroke: 4 },
  { type: "label", x: 597, y: 405, text: 'Click "Register App"' },
]);

// 04 - App Settings: "Manage Scores" button (full-page screenshot, 1440x1869)
await annotate("04-app-settings", [
  { type: "box", x: 362, y: 518, w: 165, h: 42, r: 10, stroke: 4 },
  { type: "label", x: 362, y: 580, text: 'Click "Manage Scores"' },
]);

// 05 - Deploy Scorer: "Deploy New Scorer" button
await annotate("05-deploy-scorer", [
  { type: "box", x: 478, y: 413, w: 150, h: 40, r: 10, stroke: 4 },
  { type: "label", x: 638, y: 440, text: 'Click "Deploy New Scorer"' },
]);

// 06 - Manage Scores: first 3 score inputs + Save button (full-page, 1440x1144)
await annotate("06-manage-scores", [
  { type: "box", x: 908, y: 258, w: 70, h: 32, r: 6 },
  { type: "box", x: 908, y: 302, w: 70, h: 32, r: 6 },
  { type: "box", x: 908, y: 346, w: 70, h: 32, r: 6 },
  { type: "label", x: 990, y: 290, text: "1. Enter custom scores", size: 16 },
  { type: "box", x: 232, y: 1092, w: 136, h: 40, r: 10, stroke: 4 },
  { type: "label", x: 232, y: 1085, text: '2. Click "Save"', size: 16 },
]);

// 07 - Score Explorer: reference only (no annotations, just copy)
await sharp(`${SRC}/07-score-explorer.png`).toFile(`${OUT}/07-score-explorer.png`);
console.log("✅ 07-score-explorer (no annotations)");

// 08 - Demo page: BringID modal
await annotate("08-demo-page", [
  { type: "box", x: 490, y: 180, w: 395, h: 530, r: 14, stroke: 4 },
  { type: "label", x: 490, y: 730, text: "BringID verification modal", size: 16 },
]);

console.log(`\n✓ All annotated screenshots in ${OUT}/`);
