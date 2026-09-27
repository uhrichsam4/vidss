// node tools/stills.mjs 5.2 9 12  -> out/s-<seconds>.png (times in seconds)
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import {serve} from './serve.mjs'
const root = path.resolve(import.meta.dirname, '..')
const ts = process.argv.slice(2).map(Number)
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 1920, height: 1080}})
page.on('pageerror', (e) => console.error('pageerror', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('console', m.text().slice(0, 300)))
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html')
await page.waitForFunction(() => window.ready, null, {timeout: 600000})
for (const t of ts) {
  const t0 = Date.now()
  const data = await page.evaluate(async (t) => { await window.seek(t); return document.querySelector('canvas').toDataURL('image/png') }, t)
  fs.writeFileSync(path.join(root, `out/s-${t}.png`), Buffer.from(data.split(',')[1], 'base64'))
  console.log('t', t, (Date.now() - t0) + 'ms')
}
await browser.close(); server.close()
