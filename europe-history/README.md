# How Europe rose, and what it cost the world (57s)

A 1920×1080, 60fps motion-graphics explainer in the "match cut" showreel style: one pool of 2,564 dots never
disappears. Each chapter's dots re-form into the next chapter's picture (a bouncing dot becomes Europe's
rival states, which become printing-press letters, which become ships, and so on). 120 BPM, synthesized score.
Built from one HTML file where every frame is a pure function of `seek(t)`.

## Script and sources

| # | Years | On screen | Source |
|---|---|---|---|
| 1 | c. 1400 | Europe as hundreds of rival states; China, India and the Islamic world were richer | general consensus; e.g. Kennedy, *Rise and Fall of the Great Powers*; Hoffman, *Why Did Europe Conquer the World?* (2015) |
| 2 | 1450 | Printing press; ~20 million books printed in Europe by 1500 | Febvre & Martin, *The Coming of the Book* |
| 3 | 1492–1522 | Routes of Columbus (1492), da Gama (1497–98), Magellan–Elcano (1519–22) | routes simplified to a few waypoints |
| 4 | 1492–1600 | Up to 90% of the Americas' Indigenous population died (≈60.5M → ≈6M), mostly from disease, also war and forced labour | Koch et al. 2019, *Quaternary Science Reviews* (estimates range widely; 90% is at the high end of common ranges) |
| 5 | 1500s–1860s | 12.5 million Africans forced across the Atlantic; ~1.8 million died at sea; sugar, silver and cotton profits flow to Europe | SlaveVoyages.org (12.5M embarked, 10.7M disembarked). Each dot = 100,000 people; 18 of 125 dots fade at sea |
| 6 | 1543–1687 | Scientific Revolution: Copernicus, Galileo, Newton | |
| 7 | 1760–1900 | 100 cubes = share of world manufacturing. 1750: China 33, India 25, Europe 23, rest 19. 1900: China 6, India 2, Europe 62, rest (incl. USA) 30 | Bairoch 1982, "International Industrialization Levels from 1750 to 1980" (rounded) |
| 8 | 1870–1914 | Africa coloured by colonial power by year of effective control; by 1914 only Ethiopia and Liberia independent; ~84% of Earth's land under Europe and its former colonies | Pakenham, *The Scramble for Africa*; 84%: Hoffman 2015 |
| 9 | 1945–1994 | Colours drain as countries gain independence (Ghana 1957, 17 nations in 1960, Algeria 1962 … Namibia 1990, end of apartheid 1994) | standard independence dates |
| 10 | — | "It rose by connecting the world, and by conquering much of it." | |

Simplifications worth knowing: countries are drawn with **modern borders**; each gets one colonial power and
one start year (e.g. Morocco = France 1912 though Spain held the north; South Africa counts until majority
rule in 1994; Egypt counts as independent from 1922). The share-of-Africa counter is computed from the dots.

## Render

```bash
npm install
node scripts/render.mjs cues      # out/cues.json
python3 scripts/mix_audio.py      # audio/mix.wav
node scripts/render.mjs full      # out/europe.mp4
```
