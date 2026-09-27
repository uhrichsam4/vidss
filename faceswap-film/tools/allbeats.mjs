// node tools/allbeats.mjs  -> seeks every quarter beat once and reports any error (a fast crash check before a render)
import {chromium} from 'playwright'
import {serve} from './serve.mjs'
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 360, height: 360}})
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 90000})
const bad = await page.evaluate(async () => { const out = []; for (let b = 1; b < 121; b += 0.25) { try { await window.seek((b - 1) / 2) } catch (e) { out.push(b + ': ' + e.message) } } return out })
console.log(bad.length ? bad.slice(0, 20).join('\n') : 'all beats OK')
await browser.close(); server.close()
