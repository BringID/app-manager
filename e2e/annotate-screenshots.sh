#!/bin/bash
# Annotate screenshots with red highlight boxes + instruction labels
# Coordinates from Playwright page.evaluate(getBoundingClientRect)
# Alternative: use e2e/annotate-sharp.mjs (no ImageMagick dependency)
set -e

OUT="e2e/screenshots/annotated"
mkdir -p "$OUT"

BOX="-fill none -stroke red -strokewidth 3"
BOX_THICK="-fill none -stroke red -strokewidth 4"
LABEL="-stroke none -fill red -font Arial -pointsize 20"
LABEL_SM="-stroke none -fill red -font Arial -pointsize 16"

# 01 - My Apps: "Connect Wallet" button — DOM: x:1116 y:12 w:164 h:40
magick "$OUT/01-my-apps-disconnected.png" \
  $BOX_THICK -draw "roundrectangle 1112,8 1284,56 14,14" \
  $LABEL -annotate +1040+80 'Click "Connect Wallet"' \
  "$OUT/01-my-apps-disconnected.png"
echo "01 done"

# 02 - Register App form — DOM presets: x:489 y:266; Register: x:489 y:392 w:121 h:36
magick "$OUT/02-register-app-form.png" \
  $BOX -draw "roundrectangle 475,255 895,305 10,10" \
  $LABEL_SM -annotate +905+286 "1. Pick a timelock" \
  $BOX_THICK -draw "roundrectangle 485,388 615,432 10,10" \
  $LABEL_SM -annotate +625+418 '2. Click "Register App"' \
  "$OUT/02-register-app-form.png"
echo "02 done"

# 03 - Timelock selected: "Register App" button
magick "$OUT/03-register-app-timelock-selected.png" \
  $BOX_THICK -draw "roundrectangle 485,388 615,432 10,10" \
  $LABEL -annotate +625+418 'Click "Register App"' \
  "$OUT/03-register-app-timelock-selected.png"
echo "03 done"

# 04 - App Settings: "Manage Scores →" — DOM: x:409 y:527 w:155 h:36
magick "$OUT/04-app-settings.png" \
  $BOX_THICK -draw "roundrectangle 405,523 568,567 10,10" \
  $LABEL -annotate +405+590 'Click "Manage Scores"' \
  "$OUT/04-app-settings.png"
echo "04 done"

# 05 - Deploy Scorer: "Deploy New Scorer" — DOM: x:489 y:427 w:165 h:36
magick "$OUT/05-deploy-scorer.png" \
  $BOX_THICK -draw "roundrectangle 485,423 658,467 10,10" \
  $LABEL -annotate +668+453 'Click "Deploy New Scorer"' \
  "$OUT/05-deploy-scorer.png"
echo "05 done"

# 06 - Manage Scores — DOM inputs at x:948 w:96; Save at x:272 y:1076 w:142 h:36
magick "$OUT/06-manage-scores.png" \
  $BOX -draw "roundrectangle 944,293 1048,331 6,6" \
  $BOX -draw "roundrectangle 944,344 1048,382 6,6" \
  $BOX -draw "roundrectangle 944,395 1048,433 6,6" \
  $LABEL_SM -annotate +1060+322 "1. Enter custom scores" \
  $BOX_THICK -draw "roundrectangle 268,1072 418,1116 10,10" \
  $LABEL_SM -annotate +268+1064 '2. Click "Save"' \
  "$OUT/06-manage-scores.png"
echo "06 done"

# 07 - Score Explorer: reference only (no annotations)
echo "07 done"

# 08 - Demo page: BringID modal
magick "$OUT/08-demo-page.png" \
  $BOX_THICK -draw "roundrectangle 490,180 885,710 14,14" \
  $LABEL_SM -annotate +490+730 'BringID verification modal' \
  "$OUT/08-demo-page.png"
echo "08 done"

echo ""
echo "All annotated screenshots in $OUT/"
