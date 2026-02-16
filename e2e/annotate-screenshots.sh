#!/bin/bash
# Annotate screenshots with red highlight boxes + instruction labels
# Coordinates from Playwright getBoundingBox()
set -e

DIR="e2e/screenshots"
OUT="e2e/screenshots/annotated"
mkdir -p "$OUT"

BOX="-fill none -stroke red -strokewidth 3"
BOX_THICK="-fill none -stroke red -strokewidth 4"
LABEL="-fill red -font Helvetica-Bold -pointsize 20"
LABEL_SM="-fill red -font Helvetica-Bold -pointsize 16"

# 01 - My Apps: "Connect Wallet" button
magick "$DIR/01-my-apps-disconnected.png" \
  $BOX_THICK -draw "roundrectangle 1130,8 1284,56 14,14" \
  $LABEL -annotate +1050+85 'Click "Connect Wallet"' \
  "$OUT/01-my-apps-disconnected.png"
echo "01 done"

# 02 - Register App form: timelock presets + Register App button
magick "$DIR/02-register-app-form.png" \
  $BOX -draw "roundrectangle 485,262 911,294 10,10" \
  $LABEL_SM -annotate +920+284 "1. Pick a timelock" \
  $BOX_THICK -draw "roundrectangle 485,388 610,432 10,10" \
  $LABEL_SM -annotate +620+418 '2. Click "Register App"' \
  "$OUT/02-register-app-form.png"
echo "02 done"

# 03 - Timelock selected: "Register App" button
magick "$DIR/03-register-app-timelock-selected.png" \
  $BOX_THICK -draw "roundrectangle 485,388 610,432 10,10" \
  $LABEL -annotate +620+418 'Click "Register App"' \
  "$OUT/03-register-app-timelock-selected.png"
echo "03 done"

# 05 - Deploy Scorer: "Deploy New Scorer" button
magick "$DIR/05-deploy-scorer.png" \
  $BOX_THICK -draw "roundrectangle 485,394 651,438 10,10" \
  $LABEL -annotate +660+425 'Click "Deploy New Scorer"' \
  "$OUT/05-deploy-scorer.png"
echo "05 done"

# 06 - Manage Scores: first 3 score inputs + Save button
magick "$DIR/06-manage-scores.png" \
  $BOX -draw "roundrectangle 944,264 1048,302 6,6" \
  $BOX -draw "roundrectangle 944,315 1048,353 6,6" \
  $BOX -draw "roundrectangle 944,366 1048,404 6,6" \
  $LABEL_SM -annotate +1058+290 "1. Enter custom scores" \
  $BOX_THICK -draw "roundrectangle 268,1043 412,1087 10,10" \
  $LABEL_SM -annotate +422+1073 '2. Click "Save"' \
  "$OUT/06-manage-scores.png"
echo "06 done"

# 07 - Score Explorer: reference only
cp "$DIR/07-score-explorer.png" "$OUT/07-score-explorer.png"
echo "07 copied"

# 08 - Demo page: "Get Score" button
magick "$DIR/08-demo-page.png" \
  $BOX_THICK -draw "roundrectangle 181,555 286,599 10,10" \
  $LABEL -annotate +296+585 'Click "Get Score"' \
  "$OUT/08-demo-page.png"
echo "08 done"

echo ""
echo "All annotated screenshots in $OUT/"
