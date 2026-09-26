# Game footage credits

Every game shown in the ads was made with **Claude Opus 5.5** and is open source under the **MIT license**.
Gameplay clips in `clips/` were recorded by running each game's own code (`scripts/capture.mjs`, a scripted
player on a virtual clock). Images in `stills/` are the creators' own screenshots from their repositories.
Found via the public lists [awesome-opus-5.5-games](https://github.com/skelzer/awesome-opus-5.5-games) and
[frontier-games](https://github.com/theolundqvist/frontier-games).

| Game | Creator | Repository | Used as |
|---|---|---|---|
| Turbo Kart Rally | bridge-mind | https://github.com/bridge-mind/turbo-kart-rally | gameplay clip `kart`, still `kart-select.jpg` |
| Nova Lancer | tanuu5 | https://github.com/tanuu5/nova-lancer | gameplay clip `lancer`, stills `lancer-*.jpg` |
| The Black Sedan (New Meridian) | Odiriuss | https://github.com/Odiriuss/PixelArtGameOpus | gameplay clip `sedan`, stills `sedan-*.jpg` |
| Tidewater | dgreenheck | https://github.com/dgreenheck/tidewater | stills `tidewater-*.jpg` (needs WebGPU, so no clip) |
| Tater's Flight Sim | JaredTate | https://github.com/JaredTate/tatertotsflightsim | stills `flight-*.jpg` |

GitHub mark: `stills/github-mark.svg` from [primer/octicons](https://github.com/primer/octicons) (MIT).

The MIT license lets anyone use the software (and footage of it) commercially, provided the copyright
notice is kept with copies of the software. Showing these games in an ad is still a good moment to
**ask the creators**: they may want to be featured, and it avoids implying an endorsement they didn't give.

## Rebuild

```bash
npm install
./scripts/fetch_games.sh          # clone + build the games into ./src
node scripts/capture.mjs          # record clips/<name>.mp4
./scripts/prepare_frames.sh       # unpack frames/ for the ads
```
