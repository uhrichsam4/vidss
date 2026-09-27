// node tools/stills.mjs 3 9.4 24   -> out/still-<beat>.png (film beats, 1-based: beat n starts at (n-1)/2 s)
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import {serve} from './serve.mjs'
const root = path.resolve(import.meta.dirname, '..')
const beats = process.argv.slice(2).map(Number)
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 1440, height: 1440}})
page.on('pageerror', (e) => console.error('pageerror', e.message))
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.error(m.type(), m.text().slice(0, 300)))
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html')
await page.waitForFunction(() => window.ready, null, {timeout: 600000})
fs.mkdirSync(path.join(root, 'out'), {recursive: true})
for (const b of beats) {
  const t0 = Date.now()
  const data = await page.evaluate(async (t) => { await window.seek(t); return document.querySelector('canvas').toDataURL('image/png') }, (b - 1) * 0.5)
  fs.writeFileSync(path.join(root, `out/still-${b}.png`), Buffer.from(data.split(',')[1], 'base64'))
  console.log('beat', b, (Date.now() - t0) + 'ms')
}
await browser.close(); server.close()
