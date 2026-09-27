# 3dswap: launch film (28s)

A 1440×1440, 60fps launch film in real 3D (three.js). One dark studio, one continuous camera, 120 BPM, 56 beats.
Every scene is made out of the previous one. A 3D hand skeleton drives every change. Every frame is a pure
function of `seek(t)` in `index.html`.

| Beats | Scene | |
|---|---|---|
| 0–8 | Open | The wordmark squeezes into its period, the dot swells into a glass lens, the camera pushes through, the iris snaps open |
| 8–20 | Face | Real webcam clip, face box + 5 tracked dots, chip carried onto the card, the sweep reveals the avatar mirroring the head, fps 6→30 |
| 20–32 | Hand | A model pops above the palm: pinch-drag turn, two pinches to face the camera, three fingers to grow it beside a ruler |
| 32–44 | Shelf | The ruler becomes 6 trays; pinch-pull-stretch-pop, the **first pop is on the drop** (beat 40) |
| 44–52 | Call | The breakdown: the card folds into a call, the menu drops, "Virtual camera" is picked, a self-view shows the real feed |
| 52–56 | Close | Back through the lens, the letters spring back out on the beat return. The last frame is the first frame |

## Build

```bash
npm install
# webcam clip -> eye-locked card frames + landmarks + head pose (needs src/webcam.mov, kept out of git)
ffmpeg -i src/webcam.mov -q:v 2 tmp/cam/f%03d.jpg       # then YuNet per frame -> tmp/cam/faces.json
python3 tools/webcam.py
node tools/avatar.mjs && python3 tools/avatar_align.py  # avatar rendered in the same head pose, aligned on the eyes
node tools/render.mjs cues && python3 tools/mix.py      # audio/mix.wav at -14 LUFS
node tools/render.mjs beats                             # one still per beat -> out/beats.jpg
node tools/render.mjs full                              # out/3dswap.mp4 (FPS=60 SUB=4 by default)
```

Models: `models/workspace-7..11.glb` lightened with gltf-transform (`tools/lighten.sh`), plus Rocketbox
`joe.glb` (MIT) as the sixth model.

## Credits

- **Music:** "menu_intro_music" by Christian Fernando Perucchi, from the Godot TPS demo
  (github.com/godotengine/tps-demo), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Time-stretched to 120 BPM and re-cut.
- **Sound effects:** Sonic Pi samples (CC0), Kenney starter-kit sounds (CC0), Tidewater (CC0), and the
  "charge" sound from the Godot TPS demo by Juan Linietsky & Fernando Miguel Calabró (CC BY 3.0).
  The full list is in `audio/src/CREDITS.md`.
- **HDRI:** Poly Haven (CC0). **Fonts:** Archivo and Geist (OFL).

The CC BY items need this credit wherever the film is posted (for example in the post text).
