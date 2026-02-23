#!/bin/bash
# Annotate screenshots with red highlight boxes + instruction labels
# Coordinates calibrated for 1440x900 viewport (fullPage for 04 and 06)
# Alternative: use e2e/annotate-sharp.mjs (no ImageMagick dependency)
set -e

OUT="e2e/screenshots/annotated"
mkdir -p "$OUT"

BOX="-fill none -stroke red -strokewidth 3"
BOX_THICK="-fill none -stroke red -strokewidth 4"
LABEL="-stroke none -fill red -font Arial -pointsize 20"
LABEL_SM="-stroke none -fill red -font Arial -pointsize 16"

# 01 - My Apps: "Connect Wallet" button
magick "$OUT/01-my-apps-disconnected.png" \
  $BOX_THICK -draw "roundrectangle 1075,12 1235,54 14,14" \
  $LABEL -annotate +990+80 'Click "Connect Wallet"' \
  "$OUT/01-my-apps-disconnected.png"
echo "01 done"

# 02 - Register App form: timelock presets + Register App button
magick "$OUT/02-register-app-form.png" \
  $BOX -draw "roundrectangle 475,255 895,290 10,10" \
  $LABEL_SM -annotate +905+278 "1. Pick a timelock" \
  $BOX_THICK -draw "roundrectangle 477,380 587,415 10,10" \
  $LABEL_SM -annotate +597+405 '2. Click "Register App"' \
  "$OUT/02-register-app-form.png"
echo "02 done"

# 03 - Timelock selected: "Register App" button
magick "$OUT/03-register-app-timelock-selected.png" \
  $BOX_THICK -draw "roundrectangle 477,380 587,415 10,10" \
  $LABEL -annotate +597+405 'Click "Register App"' \
  "$OUT/03-register-app-timelock-selected.png"
echo "03 done"

# 04 - App Settings: "Manage Scores" button (full-page 1440x1869)
magick "$OUT/04-app-settings.png" \
  $BOX_THICK -draw "roundrectangle 362,518 527,560 10,10" \
  $LABEL -annotate +362+580 'Click "Manage Scores"' \
  "$OUT/04-app-settings.png"
echo "04 done"

# 05 - Deploy Scorer: "Deploy New Scorer" button
magick "$OUT/05-deploy-scorer.png" \
  $BOX_THICK -draw "roundrectangle 478,413 628,453 10,10" \
  $LABEL -annotate +638+440 'Click "Deploy New Scorer"' \
  "$OUT/05-deploy-scorer.png"
echo "05 done"

# 06 - Manage Scores: first 3 score inputs + Save button (full-page 1440x1144)
magick "$OUT/06-manage-scores.png" \
  $BOX -draw "roundrectangle 908,258 978,290 6,6" \
  $BOX -draw "roundrectangle 908,302 978,334 6,6" \
  $BOX -draw "roundrectangle 908,346 978,378 6,6" \
  $LABEL_SM -annotate +990+290 "1. Enter custom scores" \
  $BOX_THICK -draw "roundrectangle 232,1092 368,1132 10,10" \
  $LABEL_SM -annotate +232+1085 '2. Click "Save"' \
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
