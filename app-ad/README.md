# App launch ad (32s)

A 32-second, 1080p60 ad for an AI-game hosting app, cut on a 120 BPM beat. Made from one HTML file
where every frame is a pure function of `seek(t)`, rendered with Playwright + ffmpeg, soundtrack
synthesized with numpy.

**App name:** `BRAND` / `TAGLINE` at the top of the `<script>` in `index.html` (placeholder: *Promptcade*).

## Scenes (beats at 120 BPM, 1 beat = 0.5s)

| Beats | Scene | What it shows |
|---|---|---|
| 0–4 | Hook | "Thousands of games are being made with AI. Where do they go?" |
| 4–8 | Logo | Logo drop with flash, shockwave and particles |
| 8–17 | For You feed | Phone scrolling live gameplay clips, like, Play button, "Made with <model>" badge |
| 17–23 | Discover | Search typing, niche chips, grid of games |
| 23–32 | Upload | HTML drop, GitHub import, publish from Claude with the skill |
| 32–36 | API | `curl` publish request typing out, `201 live` response |
| 36–43 | Leaderboard | Top games, filter by model, rows reorder |
| 43–46 | Open source | Toggle flips, source code and Fork button appear |
| 46–49 | Creator tips | Tip cards between games |
| 49–56 | Claude integration | Team room: teammates and Claude chat, live game preview changes with each message |
| 56–59 | Recap | One word per half beat: Feed · Search · Upload · API · Leaderboard · Open source |
| 59–64 | End card | Logo, "Upload your first game.", "Get early access" |

The mini-games inside the cards (runner, shooter, blocks, racer, farm, dungeon) are drawn procedurally
on canvas, so the "gameplay" is real animation, not screenshots.

## Render

```bash
npm install
node scripts/render.mjs cues      # out/cues.json: sound cues exported from the page
python3 scripts/mix_audio.py      # audio/mix.wav
node scripts/render.mjs full      # out/ad.mp4 (SUB=4 WORKERS=4)
```

Preview: open `index.html` in a browser (loops), or `index.html?t=12.5` to freeze a frame.
`node scripts/render.mjs sheet 0.5` makes a contact sheet.
