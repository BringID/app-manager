/**
 * Annotate screenshots with red highlight boxes + instruction labels using sharp.
 * Drop-in replacement for annotate-screenshots.sh when ImageMagick is unavailable.
 *
 * Coordinates from Playwright page.evaluate(getBoundingClientRect):
 *   01 Connect Wallet: x:1116 y:12 w:164 h:40
 *   02 Preset row: x:489 y:266 → x:561 y:322 (first…last preset)
 *   02 Register App: x:489 y:392 w:121 h:36
 *   04 Manage Scores: x:409 y:527 w:155 h:36
 *   05 Deploy New Scorer: x:489 y:427 w:165 h:36
 *   06 Input 1 (100): x:948 y:297 w:96 h:30
 *   06 Input 2 (200): x:948 y:348 w:96 h:30
 *   06 Input 3 (150): x:948 y:399 w:96 h:30
 *   06 Save button: x:272 y:1076 w:142 h:36
 */
import sharp from "sharp";
import { mkdirSync } from "fs";

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

// 01 - My Apps: "Connect Wallet" button — DOM: x:1116 y:12 w:164 h:40
await annotate("01-my-apps-disconnected", [
  { type: "box", x: 1112, y: 8, w: 172, h: 48, r: 14, stroke: 4 },
  { type: "label", x: 1040, y: 80, text: 'Click "Connect Wallet"' },
]);

// 02 - Register App form — DOM presets: x:489 y:266; Register: x:489 y:392 w:121 h:36
await annotate("02-register-app-form", [
  { type: "box", x: 475, y: 255, w: 420, h: 50, r: 10 },
  { type: "label", x: 905, y: 286, text: "1. Pick a timelock", size: 16 },
  { type: "box", x: 485, y: 388, w: 130, h: 44, r: 10, stroke: 4 },
  { type: "label", x: 625, y: 418, text: '2. Click "Register App"', size: 16 },
]);

// 03 - Timelock selected: "Register App" button — same coords as 02
await annotate("03-register-app-timelock-selected", [
  { type: "box", x: 485, y: 388, w: 130, h: 44, r: 10, stroke: 4 },
  { type: "label", x: 625, y: 418, text: 'Click "Register App"' },
]);

// 04 - App Settings: "Manage Scores →" — DOM: x:409 y:527 w:155 h:36
await annotate("04-app-settings", [
  { type: "box", x: 405, y: 523, w: 163, h: 44, r: 10, stroke: 4 },
  { type: "label", x: 405, y: 590, text: 'Click "Manage Scores"' },
]);

// 05 - Deploy Scorer: "Deploy New Scorer" — DOM: x:489 y:427 w:165 h:36
await annotate("05-deploy-scorer", [
  { type: "box", x: 485, y: 423, w: 173, h: 44, r: 10, stroke: 4 },
  { type: "label", x: 668, y: 453, text: 'Click "Deploy New Scorer"' },
]);

// 06 - Manage Scores — DOM inputs at x:948 y:297/348/399 w:96 h:30; Save at x:272 y:1076 w:142 h:36
await annotate("06-manage-scores", [
  { type: "box", x: 944, y: 293, w: 104, h: 38, r: 6 },
  { type: "box", x: 944, y: 344, w: 104, h: 38, r: 6 },
  { type: "box", x: 944, y: 395, w: 104, h: 38, r: 6 },
  { type: "label", x: 1060, y: 322, text: "1. Enter custom scores", size: 16 },
  { type: "box", x: 268, y: 1072, w: 150, h: 44, r: 10, stroke: 4 },
  { type: "label", x: 268, y: 1064, text: '2. Click "Save"', size: 16 },
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
