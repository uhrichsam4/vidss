// Real games made with Claude Opus 5.5, all MIT licensed. Gameplay clips were recorded from the
// open-source code (scripts/capture.mjs); stills are the creators' own screenshots from their repos.
// Pages load this with <script src="../game-clips/games.js"> and use GAME_PLAYER to show clips.
window.REAL_GAMES = {
  kart: { title: 'Turbo Kart Rally', by: '@bridge-mind', repo: 'github.com/bridge-mind/turbo-kart-rally', genre: 'Racing', model: 'Claude Opus 5.5', clip: 'kart', stills: ['kart-select.jpg'] },
  lancer: { title: 'Nova Lancer', by: '@tanuu5', repo: 'github.com/tanuu5/nova-lancer', genre: 'Shooter', model: 'Claude Opus 5.5', clip: 'lancer', stills: ['lancer-boss.jpg', 'lancer-canyon.jpg', 'lancer-city.jpg'] },
  sedan: { title: 'The Black Sedan', by: '@Odiriuss', repo: 'github.com/Odiriuss/PixelArtGameOpus', genre: 'Pixel noir', model: 'Claude Opus 5.5', clip: 'sedan', stills: ['sedan-club.jpg', 'sedan-chase.jpg', 'sedan-skyline.jpg'] },
  tidewater: { title: 'Tidewater', by: '@dgreenheck', repo: 'github.com/dgreenheck/tidewater', genre: 'Fishing', model: 'Claude Opus 5.5', clip: null, stills: ['tidewater-pier.jpg', 'tidewater-beach.jpg'] },
  flight: { title: "Tater's Flight Sim", by: '@JaredTate', repo: 'github.com/JaredTate/tatertotsflightsim', genre: 'Flight sim', model: 'Claude Opus 5.5', clip: null, stills: ['flight-f16.jpg', 'flight-747.jpg'] },
}
window.GAME_CREDITS = "Games: Turbo Kart Rally (bridge-mind) · Nova Lancer (tanuu5) · The Black Sedan (Odiriuss) · Tidewater (dgreenheck) · Tater's Flight Sim (JaredTate) — made with Claude Opus 5.5, MIT licensed"

// Frame-accurate clip player for seek(t) pages: set(t) swaps to the right frame and returns a promise
// that resolves once it is decoded, so the renderer never screenshots a half-loaded frame.
window.GAME_PLAYER = (() => {
  const BASE = (document.currentScript && document.currentScript.src.replace(/games\.js.*$/, '')) || '../game-clips/'
  const FRAMES = { kart: 48, lancer: 144, sedan: 144 } // kart: the scripted driver hits a wall after 2s, so the clip stops there
  const FPS = 24
  const still = (name) => BASE + 'stills/' + name
  function clip(img, name, offset = 0) {
    let cur = ''
    return (t) => {
      const n = FRAMES[name]
      const i = ((Math.floor((t + offset) * FPS) % n) + n) % n
      const src = `${BASE}frames/${name}/${String(i).padStart(4, '0')}.jpg`
      if (src === cur) return null
      cur = src
      img.src = src
      return img.decode().catch(() => {})
    }
  }
  return { clip, still, FRAMES, FPS }
})()
