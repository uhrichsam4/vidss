#!/usr/bin/env bash
# Makes light copies of the source GLBs: <=150k triangles, textures <=1024px WebP (spec step 4).
# usage: tools/lighten.sh   -> assets/models/m1.glb ... m6.glb
set -e
cd "$(dirname "$0")/.."
GT=node_modules/.bin/gltf-transform
i=0
for f in ../models/workspace-7.glb ../models/workspace-8.glb ../models/workspace-9.glb ../models/workspace-10.glb ../models/workspace-11.glb ../game-clips/src/tidewater/public/models/characters/joe.glb; do
  i=$((i+1)); out=assets/models/m$i.glb; tmp=tmp/light-$i
  mkdir -p tmp
  $GT dequantize "$f" $tmp-a.glb
  $GT weld $tmp-a.glb $tmp-b.glb
  $GT simplify $tmp-b.glb $tmp-c.glb --ratio 0.12 --error 0.002
  $GT resize $tmp-c.glb $tmp-d.glb --width 1024 --height 1024
  $GT webp $tmp-d.glb $out --quality 88
  rm -f $tmp-*.glb
  echo "m$i <- $f  $(du -h $out | cut -f1)"
done
