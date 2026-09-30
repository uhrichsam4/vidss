// node tools/stills.mjs 1.5 4 ... -> out/s-<t>.png
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import {serve} from './serve.mjs'
const root = path.resolve(import.meta.dirname, '..'); const ts = process.argv.slice(2).map(Number)
const {server, url} = await serve()
const browser = await chromium.launch()
const page = await browser.newPage({viewport: {width: 1440, height: 1080}})
page.on('pageerror', (e) => console.error('pageerror', e.message))
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 60000})
fs.mkdirSync(path.join(root, 'out'), {recursive: true})
for (const t of ts) { const d = await page.evaluate(async (t) => { await window.seek(t); return document.getElementById('c').toDataURL('image/png') }, t); fs.writeFileSync(path.join(root, `out/s-${t}.png`), Buffer.from(d.split(',')[1], 'base64')) }
await browser.close(); server.close(); console.log('ok')
