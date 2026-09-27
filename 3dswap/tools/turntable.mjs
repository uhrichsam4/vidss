// node tools/turntable.mjs [--preview] -> assets/turntables/<name>/00.png ... 23.png (768x768, transparent)
// Model list and per-model yaw (so frame 0 faces the viewer) live in MODELS below.
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'

const root = path.resolve(import.meta.dirname, '..')
const MODELS = [
  ['m1', 'models/workspace-7.glb', 0], ['m2', 'models/workspace-8.glb', 0], ['m3', 'models/workspace-9.glb', 0],
  ['m4', 'models/workspace-10.glb', 0], ['m5', 'models/workspace-11.glb', 0],
  ['m6', 'game-clips/src/tidewater/public/models/characters/joe.glb', 0], // Microsoft Rocketbox avatar (MIT) until a 6th model arrives
]
const MAP = { '/three/': path.join(root, 'node_modules/three/') }
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0])
  let f = u.startsWith('/three/') ? path.join(MAP['/three/'], u.slice(7)) : u.startsWith('/repo/') ? path.join(root, '..', u.slice(6)) : path.join(root, 'tools', u)
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
  const ext = path.extname(f)
  res.writeHead(200, {'content-type': {'.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.png': 'image/png'}[ext] || 'application/octet-stream'})
  fs.createReadStream(f).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 768, height: 768}})
page.on('pageerror', (e) => console.error('pageerror', e.message))
page.on('console', (m) => m.type() === 'error' && console.error(m.text()))
await page.goto(base + '/turntable.html')
await page.waitForFunction(() => window.ready)
const preview = process.argv.includes('--preview')
for (const [name, file, yaw] of MODELS) {
  const info = await page.evaluate((u) => window.load(u), '/repo/' + file)
  const dir = path.join(root, preview ? 'tmp/preview' : `assets/turntables/${name}`)
  fs.mkdirSync(dir, {recursive: true})
  for (let k = 0; k < (preview ? 4 : 24); k++) {
    const url = await page.evaluate(([k, y]) => window.frame(k, y), [k * (preview ? 6 : 1), yaw])
    fs.writeFileSync(path.join(dir, preview ? `${name}-${k}.png` : `${String(k).padStart(2, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'))
  }
  console.log(name, file, info.size)
}
await browser.close(); server.close()
