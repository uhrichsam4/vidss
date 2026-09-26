// Records real gameplay from open-source browser games, frame by frame on a virtual clock.
//
//   node scripts/capture.mjs [name ...]   -> clips/<name>.mp4 (24fps) for each game in GAMES
//   node scripts/capture.mjs --probe name -> clips/probe-<name>-{1..4}.jpg, one per second of scripted play
//
// Games are cloned into ./src (see fetch_games.sh). A local http server serves them so ES modules work.
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import {spawn} from 'node:child_process'

const root = path.resolve(import.meta.dirname, '..')
const src = path.join(root, 'src')
const FPS = 24

// ---------- tiny static server ----------
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav'}
const server = http.createServer((req, res) => {
  const p = path.join(src, decodeURIComponent(req.url.split('?')[0]))
  const f = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'index.html') : p
  if (!f.startsWith(src) || !fs.existsSync(f)) { res.writeHead(404); return res.end() }
  res.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'})
  fs.createReadStream(f).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}`

// ---------- scripted players ----------
const rnd = (() => { let s = 42; return () => ((s = (s * 16807) % 2147483647) / 2147483647) })()
const hold = async (page, i, every, keys) => { // cycle held keys every `every` frames
  const k = keys[Math.floor(i / every) % keys.length], prev = keys[(Math.floor(i / every) + keys.length - 1) % keys.length]
  if (i % every === 0) { for (const x of [].concat(prev)) await page.keyboard.up(x); for (const x of [].concat(k)) await page.keyboard.down(x) }
}
const GAMES = {
  // Turbo Kart Rally — five Claude Opus 5.5 sub-agents, one prompt (bridge-mind/turbo-kart-rally, MIT)
  kart: {
    url: '/turbo-kart-rally/index.html', size: [960, 540], seconds: 6, warmup: 3,
    async start(page, sz, tick) { for (let n = 0; n < 6; n++) { await page.keyboard.press('Enter'); for (let i = 0; i < 25; i++) await tick() } for (let i = 0; i < 150; i++) await tick() },
    async step(page, i) {
      if (i === 0) await page.keyboard.down('ArrowUp')
      await hold(page, i, 22, [[], 'ArrowLeft', [], 'ArrowRight'])
      if (i % 70 === 40) await page.keyboard.press('KeyE')
    },
  },
  // Nova Lancer — Claude Code x Claude Opus 5.5 MAX (tanuu5/nova-lancer, MIT)
  lancer: {
    url: '/nova-lancer/dist/nova-lancer.html', size: [960, 540], seconds: 6, warmup: 3,
    async start(page, sz, tick) { for (let n = 0; n < 6; n++) { await page.keyboard.press('Enter'); await page.keyboard.press('Space'); for (let i = 0; i < 25; i++) await tick() } },
    async step(page, i) {
      if (i === 0) await page.keyboard.down('KeyJ')
      await hold(page, i, 18, ['KeyW', 'KeyD', 'KeyS', 'KeyA'])
      if (i % 80 === 60) await page.keyboard.press('KeyL')
    },
  },
  // New Meridian: The Black Sedan — Claude Opus 5.5 (Odiriuss/PixelArtGameOpus, MIT)
  sedan: {
    url: '/PixelArtGameOpus/hourglass_testlevel.html', size: [960, 540], seconds: 6, warmup: 2,
    async start(page, [w, h], tick) { for (let n = 0; n < 4; n++) { await page.keyboard.press('Enter'); await page.mouse.click(w / 2, h / 2); for (let i = 0; i < 25; i++) await tick() } },
    async step(page, i, [w, h]) {
      await hold(page, i, 20, ['KeyD', ['KeyD', 'KeyW'], 'KeyD', ['KeyD', 'KeyS']])
      await page.mouse.move(w * 0.7 + Math.sin(i / 9) * 120, h * 0.5 + Math.cos(i / 7) * 80)
      if (i % 10 === 0) await page.mouse.click(w * 0.7 + Math.sin(i / 9) * 120, h * 0.5 + Math.cos(i / 7) * 80)
      if (i === 90) await page.keyboard.press('KeyE')
    },
  },
  // Tidewater — island fishing game built with Opus 5.5 (dgreenheck/tidewater, MIT). Needs WebGPU.
  tidewater: {
    url: '/tidewater/dist/index.html', size: [960, 540], seconds: 6, warmup: 5,
    async start(page, [w, h], tick) { for (let n = 0; n < 3; n++) { await page.mouse.click(w / 2, h / 2); await page.keyboard.press('Enter'); for (let i = 0; i < 30; i++) await tick() } },
    async step(page, i) { await hold(page, i, 40, ['KeyW', ['KeyW', 'KeyA'], 'KeyW', ['KeyW', 'KeyD']]) },
  },
  // Tater's Flight Sim — Claude Opus 5.5 (JaredTate/tatertotsflightsim, MIT)
  flight: {
    url: '/tatertotsflightsim/dist/index.html', size: [960, 540], seconds: 6, warmup: 8,
    async start(page, [w, h], tick) {
      for (let n = 0; n < 3; n++) { await page.keyboard.press('Enter'); await page.mouse.click(w / 2, h / 2); for (let i = 0; i < 30; i++) await tick() }
      await page.keyboard.down('KeyW'); for (let i = 0; i < 300; i++) await tick() // full throttle down the runway
      await page.keyboard.down('ArrowDown'); for (let i = 0; i < 90; i++) await tick(); await page.keyboard.up('ArrowDown') // rotate, climb out
      for (let i = 0; i < 120; i++) await tick()
    },
    async step(page, i) { await hold(page, i, 45, [[], 'ArrowLeft', [], 'ArrowRight']) },
  },
}

function run(cmd, args) {
  return new Promise((resolve, reject) => { const p = spawn(cmd, args, {stdio: 'inherit'}); p.on('exit', (c) => (c === 0 ? resolve() : reject(new Error(cmd + ' ' + c)))) })
}

const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-unsafe-webgpu', '--enable-features=Vulkan,WebGPU', '--use-webgpu-adapter=swiftshader', '--autoplay-policy=no-user-gesture-required']})
async function open(g) {
  const page = await browser.newPage({viewport: {width: g.size[0], height: g.size[1]}, deviceScaleFactor: 1})
  await page.addInitScript({path: path.join(root, 'scripts/virtual_time.js')})
  page.on('pageerror', (e) => console.error('pageerror', e.message))
  // three.js from the CDN is served from the same version in node_modules; every other outside request is dropped
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, (r) => {
    const m = r.request().url().match(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/)
    if (!m) return r.abort()
    const f = path.join(root, 'node_modules/three', m[1])
    return fs.existsSync(f) ? r.fulfill({path: f, contentType: 'text/javascript'}) : r.abort()
  })
  await page.goto(base + g.url, {waitUntil: 'load'})
  const tick = () => page.evaluate((dt) => window.__advance(dt), 1000 / FPS)
  // CDP capture is ~10x faster than page.screenshot here (which waits for a real frame the virtual clock never gives)
  const cdp = await page.context().newCDPSession(page)
  page.grab = async (file) => {
    const {data} = await cdp.send('Page.captureScreenshot', {format: 'jpeg', quality: 90, optimizeForSpeed: true, fromSurface: true})
    fs.writeFileSync(file, Buffer.from(data, 'base64'))
  }
  for (let i = 0; i < g.warmup * FPS; i++) await tick()
  return {page, tick}
}

const args = process.argv.slice(2)
if (args[0] === '--probe') {
  const g = GAMES[args[1]]
  const {page, tick} = await open(g)
  if (g.start) await g.start(page, g.size, tick)
  for (let i = 0; i < 96; i++) {
    await g.step?.(page, i, g.size)
    await tick()
    if (i % 24 === 23) await page.grab(path.join(root, 'clips', `probe-${args[1]}-${(i + 1) / 24}.jpg`))
  }
  console.log('probe written')
} else {
  for (const name of args.length ? args : Object.keys(GAMES)) {
    const g = GAMES[name]
    const dir = path.join(root, 'tmp', name)
    fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true})
    const {page, tick} = await open(g)
    if (g.start) await g.start(page, g.size, tick)
    const n = g.seconds * FPS
    for (let i = 0; i < n; i++) {
      await g.step?.(page, i, g.size)
      await tick()
      await page.grab(path.join(dir, `${String(i).padStart(4, '0')}.jpg`))
    }
    await page.close()
    await run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, '%04d.jpg'), '-c:v', 'libx264', '-crf', '20', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(root, 'clips', `${name}.mp4`)])
    console.log(`captured ${name}: ${n} frames`)
  }
}
await browser.close()
server.close()
