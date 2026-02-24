/**
 * Annotate screenshots with red highlight boxes and labels using sharp + SVG.
 * Replacement for annotate-screenshots.sh (which requires ImageMagick).
 */
import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "e2e/screenshots";
const OUT = "e2e/screenshots/annotated";
mkdirSync(OUT, { recursive: true });

/**
 * Draw rounded-rect highlights and text labels on a screenshot.
 * @param {string} name - filename without path
 * @param {{ box: [number,number,number,number], r?: number, thick?: boolean, label?: string, lx: number, ly: number, small?: boolean }[]} annotations
 */
async function annotate(name, annotations) {
  const input = `${SRC}/${name}`;
  const output = `${OUT}/${name}`;
  const meta = await sharp(input).metadata();
  const w = meta.width;
  const h = meta.height;

  if (annotations.length === 0) {
    // Just copy
    await sharp(input).toFile(output);
    console.log(`✅ ${name} (no annotations)`);
    return;
  }

  const svgParts = [];
  for (const a of annotations) {
    const [x1, y1, x2, y2] = a.box;
    const rx = a.r ?? 10;
    const sw = a.thick ? 4 : 3;
    svgParts.push(
      `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="${rx}" ry="${rx}" fill="none" stroke="#ff3333" stroke-width="${sw}"/>`
    );
    if (a.label) {
      const fontSize = a.small ? 15 : 18;
      const textLen = a.label.length * (fontSize * 0.56);
      const pad = 6;
      svgParts.push(
        `<rect x="${a.lx - pad}" y="${a.ly - fontSize - 2}" width="${textLen + pad * 2}" height="${fontSize + 8}" rx="4" ry="4" fill="rgba(0,0,0,0.8)"/>`,
        `<text x="${a.lx}" y="${a.ly}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#ff3333" font-weight="bold">${escXml(a.label)}</text>`
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${svgParts.join("")}</svg>`;

  await sharp(input)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(output);

  console.log(`✅ ${name}`);
}

function escXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Coordinates from Playwright getBoundingBox() — pad by ~4px for visibility

// 01 - My Apps: "Connect Wallet" button (x:1137 y:12 w:143 h:40)
await annotate("01-my-apps-disconnected.png", [
  { box: [1133, 8, 1284, 56], r: 14, thick: true, label: 'Click "Connect Wallet"', lx: 1020, ly: 80 },
]);

// 02 - Register App form: timelock presets row + (Register App btn not visible without wallet)
//   1 day btn at (489, 266), Disabled at (489+72, 298+24) → row spans ~489..780, 262..326
await annotate("02-register-app-form.png", [
  { box: [485, 260, 780, 328], r: 10, label: "1. Pick a timelock preset", lx: 790, ly: 300, small: true },
]);

// 03 - Timelock selected: same layout, "1 day" is active
await annotate("03-register-app-timelock-selected.png", [
  { box: [485, 260, 550, 294], r: 10, thick: true, label: '"1 day" selected — click "Register App"', lx: 560, ly: 284, small: true },
]);

// 04 - App Settings: "Manage Scores" button (x:409 y:527 w:139 h:36)
await annotate("04-app-settings.png", [
  { box: [405, 523, 552, 567], r: 10, thick: true, label: 'Click "Manage Scores"', lx: 560, ly: 553 },
]);

// 05 - Deploy Scorer: "Deploy New Scorer" button (x:489 y:427 w:165 h:36)
await annotate("05-deploy-scorer.png", [
  { box: [485, 423, 658, 467], r: 10, thick: true, label: 'Click "Deploy New Scorer"', lx: 668, ly: 453 },
]);

// 06 - Manage Scores: score inputs + Copy defaults + Save
//   input1: (891, 297, 96x30), input2: (891, 348), input3: (891, 399)
//   Copy defaults: (1000, 261, 83x16)
//   Save: (272, 1076, 142x36)
await annotate("06-manage-scores.png", [
  { box: [886, 293, 990, 330], r: 6, label: "1. Enter custom scores", lx: 1000, ly: 312, small: true },
  { box: [886, 344, 990, 381], r: 6 },
  { box: [886, 395, 990, 432], r: 6 },
  { box: [996, 257, 1086, 281], r: 4, label: 'or click "Copy defaults"', lx: 996, ly: 252, small: true },
  { box: [268, 1072, 418, 1116], r: 10, thick: true, label: '2. Click "Save"', lx: 268, ly: 1064, small: true },
]);

// 07 - Score Explorer: reference only
await annotate("07-score-explorer.png", []);

// 08 - Demo page: "Verify Humanity" button (x:185 y:433 w:144 h:36)
await annotate("08-demo-page.png", [
  { box: [181, 429, 333, 473], r: 10, thick: true, label: 'Click "Verify Humanity"', lx: 343, ly: 459 },
]);

console.log(`\n✓ All annotated screenshots in ${OUT}/`);
