# Migration map, 1922–2100

A 20-second, 60fps motion-graphics video: a dotted globe unrolls into a world map, then red dots fly from
the rest of the world **into the United States, Canada, Europe, Australia and New Zealand**, 1922 to 2100.
Each dot is **100,000 people** and stays where it lands. The year sits top centre; five counters add up
arrivals; captions name the big events. After 2025 the dots turn lighter and everything is labelled
**projection**.

Only people coming from **outside** those five destinations are drawn: Latin America, Asia, Africa, the
Middle East and the Pacific. "Europe" follows the UN M49 regions, so Russia, Ukraine and the Balkans count
as Europe (not drawn) while Turkey, Kazakhstan and the Caucasus count as Asia (drawn).

Made the same way as the "one HTML file" videos: no Remotion, no After Effects.

```
index.html              the whole video: canvas + HTML overlay, every frame is a pure function of seek(t)
data/flows.js           the numbers: who moved where, when, how many (with sources) + projections + captions
data/world.js           generated: 15k land dots on a 1° grid, tagged by country (Natural Earth 1:50m)
scripts/build_world.mjs builds data/world.js from world-atlas
scripts/mix_audio.py    numpy soundtrack: ambient pad, soft pulse, whoosh/boom/ticks, one blip per arrival
scripts/render.mjs      Playwright: seek(t) per subframe -> ffmpeg tmix (motion blur) -> 60fps mp4 + audio
```

## Render

```bash
npm install
npm run build:world                 # data/world.js (already committed)
node scripts/render.mjs cues        # out/cues.json: sound cues exported from the page
python3 scripts/mix_audio.py        # audio/mix.wav (needs numpy)
node scripts/render.mjs full        # out/migration.mp4   (SUB=4 WORKERS=4 by default)
```

Preview in a browser: open `index.html` (it loops), or `index.html?t=9.5` to freeze a moment.
`node scripts/render.mjs sheet 0.5` makes a contact sheet with one tile every 0.5s.

## How it works

- **Time → year.** 4.3–12.4s covers 1922→2025, a short hold on "latest data", then 13.1–17.2s covers
  2025→2100. The speed curve eases in and out so the counter never jerks. Each dot lands in its own year,
  so the counters always match the year on screen.
- **Dots.** Each data row (e.g. Italy → US, 1922–1930, 0.45M) becomes 0.45M / 100k ≈ 4–5 dots with random
  departure years inside the range. Start and end points are picked from real land dots near the origin
  and destination cities, so nothing lands in the sea.
- **Routes.** Arcs bend north and take the shorter way round, so flights from East Asia to the US and
  Canada cross the Pacific (they leave the right edge and come back in on the left).
- **Globe → map.** Every land dot has a globe position (orthographic) and a map position
  (Natural Earth projection); the intro interpolates between them, centre first.
- **Motion blur.** 4 renders per frame, blended by ffmpeg `tmix`.

## Where the numbers come from

All figures are **rounded estimates**. They are good for showing the big picture; check the originals
before quoting an exact number.

| | History (1922–2024) | Projection (2025–2100) |
|---|---|---|
| USA | DHS Yearbook of Immigration Statistics (new permanent residents by decade and country); 2021–24 Census Bureau net international migration, which includes humanitarian and border arrivals | ~0.9M/yr, US Census Bureau 2023 projections, main series |
| Canada | Statistics Canada / IRCC permanent resident admissions | ~0.38M/yr, IRCC levels plan 2026–28, Statistics Canada medium scenario |
| Europe | EU + UK + Switzerland/Norway, arrivals from outside Europe: Eurostat, OECD, UN DESA, ONS, and standard histories for the guest-worker and post-colonial eras. Least precise, treat as order of magnitude. | ~1.2M/yr, Eurostat EUROPOP2023 baseline + ONS |
| Australia | ABS / Home Affairs settler arrivals and permanent migration by country of birth | ~0.235M/yr, Treasury / ABS net overseas migration assumption |
| New Zealand | Stats NZ arrivals and residence approvals (Pacific, Asia, Africa) | ~0.03M/yr, Stats NZ median |

For projections, the share of each rate coming from Western countries (e.g. UK → Australia) is removed
along with those origins, so ~0.87M/yr is drawn for the US, 0.34 Canada, 1.08 Europe, 0.21 Australia,
0.026 New Zealand.

Choices worth knowing when you present it:

- US and Canada decade totals are calibrated to the official figures (DHS, StatCan) using every source
  country, then the Western origins are dropped. That keeps the non-Western part of each decade right.
- The 1990s IRCA legalizations in the US (people who arrived earlier) are shown in the 1980s, when they
  arrived.
- Moves between Western countries are left out on purpose: Europeans to the Americas, Brits to Australia,
  Poles to Germany, and the ~4M Ukrainians protected in the EU since 2022.
- Before the 1960s–70s the US, Canada and Australia had race-based rules that kept non-European
  immigration very small; the empty early map reflects that.
- Projection origins follow 2015–2024 patterns. That is an assumption, not a forecast of who will come.
- Dots show people **arriving**. They don't subtract people who later left or died.

Map data: Natural Earth (public domain) via `world-atlas`. Fonts: Inter and JetBrains Mono (SIL OFL,
licenses in `assets/fonts`).
