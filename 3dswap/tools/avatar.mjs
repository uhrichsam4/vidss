// node tools/avatar.mjs [every]  -> tmp/avatar/###.png : the after-avatar (m4 = lightened workspace-10) in each webcam frame's head pose
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
const root = path.resolve(import.meta.dirname, '..')
const every = +(process.argv[2] || 1)
const track = JSON.parse(fs.readFileSync(path.join(root, 'assets/webcam/track.json')))
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0])
  const f = u.startsWith('/three/') ? path.join(root, 'node_modules/three', u.slice(7)) : u.startsWith('/repo/') ? path.join(root, '..', u.slice(6)) : path.join(root, 'tools', u)
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
  res.writeHead(200, {'content-type': {'.html': 'text/html', '.js': 'text/javascript'}[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 640, height: 800}})
await page.goto(`http://127.0.0.1:${server.address().port}/turntable.html`)
await page.waitForFunction(() => window.ready)
await page.evaluate((u) => window.load(u), process.env.GLB || '/repo/3dswap/assets/models/m4.glb')
fs.mkdirSync(path.join(root, process.env.OUTDIR || 'tmp/avatar'), {recursive: true})
for (let i = 0; i < track.n; i += every) {
  const [yaw, pitch, roll] = track.frames[i].pose
  const url = await page.evaluate((a) => window.portraitPose(0.08, 4.5, ...a), [yaw, pitch, roll])
  fs.writeFileSync(path.join(root, (process.env.OUTDIR || 'tmp/avatar') + `/${String(i).padStart(3, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'))
  if (i % 30 === 0) console.log('frame', i)
}
await browser.close(); server.close()
