#!/usr/bin/env bash
# Unpacks each clips/<name>.mp4 into frames/<name>/0000.jpg ... (24fps) for the frame-accurate player.
# frames/ is generated (gitignored); run this once before rendering the ads.
set -e
cd "$(dirname "$0")/.."
for f in clips/*.mp4; do
  n=$(basename "$f" .mp4); mkdir -p "frames/$n"; rm -f "frames/$n"/*.jpg
  ffmpeg -v error -y -i "$f" -q:v 3 -start_number 0 "frames/$n/%04d.jpg"
  echo "$n: $(ls frames/$n | wc -l) frames"
done
