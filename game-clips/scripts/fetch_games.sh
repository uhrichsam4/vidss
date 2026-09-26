#!/usr/bin/env bash
# Clones and builds the Opus 5.5 games used for footage (all MIT, see CREDITS.md). Needs npm.
set -e
cd "$(dirname "$0")/.."
mkdir -p src && cd src
for r in bridge-mind/turbo-kart-rally tanuu5/nova-lancer Odiriuss/PixelArtGameOpus dgreenheck/tidewater JaredTate/tatertotsflightsim; do
  n=$(basename "$r"); [ -d "$n" ] || git clone -q --depth 1 "https://github.com/$r.git" "$n"
done
(cd nova-lancer && npm install --no-audit --no-fund --ignore-scripts && npm run build)
(cd tidewater && npm install --no-audit --no-fund --ignore-scripts && npx vite build --base ./)
(cd tatertotsflightsim && npm install --no-audit --no-fund --ignore-scripts && npx vite build --base ./)
cd .. && npm install --no-audit --no-fund three@0.170.0   # Turbo Kart Rally loads three.js from a CDN; served locally
echo "games ready in ./src"
