# App ad, "UI morph" style (23s loop, square)

A 1440×1440, 60fps, seamlessly looping ad in the one-shape "UI morph" style: a single white shape never
cuts; it morphs from one piece of the app into the next while a cursor clicks through it. Each section
floods a new background color from the cursor, and the shape floods its own color the same way.
12 bars at 125 BPM. Built from one HTML file where every style is a pure function of `seek(t)`.

**App name:** `BRAND` near the top of the `<script>` in `index.html` (placeholder: *Promptcade*).

## States (beats at 125 BPM)

| Beat | State | Interaction |
|---|---|---|
| 46 → 0 | Logo pill | loop start / end |
| 2 | Search bar | click, types "cozy pixel games" |
| 5 | Niche chips | picks Cozy, Pixel art |
| 8 | For You card | live mini-game, like (heart pops), swipe to the next game |
| 12 | Leaderboard | real Opus 5.5 games, filter "Shooter", rows reorder |
| 16 | HTML drop zone | cursor drags `index.html` in |
| 18 | Upload ring | 0 → 100%, check, shape floods violet |
| 21 | GitHub | Import → Synced ✓ |
| 24 | Claude skill | "publish this to …", tool call, "Live" |
| 27 | API | `POST /v1/games`, Run, `201 · live` |
| 30 | Open source | toggle on |
| 33 | Creator tips | tip card drops in, stack fans out on hover |
| 37 | Team | avatars pop, spread on hover, "+" becomes Claude |
| 41 | Live build | Claude's change lights the game and adds enemies |
| 44 | CTA | "Upload your first game →", click |

## Real games

The feed card (Turbo Kart Rally → Nova Lancer) and the leaderboard (Nova Lancer, Turbo Kart Rally,
Tidewater) show **real games made with Claude Opus 5.5**, MIT licensed, credited on screen. Gameplay was
recorded from their open-source code; see `../game-clips/CREDITS.md`. Unpack the clips once before
rendering: `cd ../game-clips && ./scripts/prepare_frames.sh`.

## Render

```bash
npm install
node scripts/render.mjs cues      # out/cues.json
python3 scripts/mix_audio.py      # audio/mix.wav (loops seamlessly)
node scripts/render.mjs full      # out/morph.mp4
```

Preview: open `index.html` in a browser, or `index.html?t=5.2` to freeze a frame.
