// node tools/portrait.mjs name glb y d  -> tmp/portrait-<name>.png (straight-on face render, 960x1200, transparent)
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
const root = path.resolve(import.meta.dirname, '..')
const [name, file, y, d] = process.argv.slice(2)
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0])
  const f = u.startsWith('/three/') ? path.join(root, 'node_modules/three', u.slice(7)) : u.startsWith('/repo/') ? path.join(root, '..', u.slice(6)) : path.join(root, 'tools', u)
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
  res.writeHead(200, {'content-type': {'.html': 'text/html', '.js': 'text/javascript'}[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 960, height: 1200}})
await page.goto(`http://127.0.0.1:${server.address().port}/turntable.html`)
await page.waitForFunction(() => window.ready)
await page.evaluate((u) => window.load(u), '/repo/' + file)
const url = await page.evaluate(([y, d]) => window.portrait(y, d), [+y, +d])
fs.mkdirSync(path.join(root, 'tmp'), {recursive: true})
fs.writeFileSync(path.join(root, `tmp/portrait-${name}.png`), Buffer.from(url.split(',')[1], 'base64'))
console.log('wrote', name); await browser.close(); server.close()
