// node tools/check.mjs -> seeks every 0.1 s once and reports errors
import {chromium} from 'playwright'
import {serve} from './serve.mjs'
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 480, height: 270}})
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 90000})
const bad = await page.evaluate(async () => { const out = []; const D = window.timeline().duration; for (let t = 0; t < D; t += 0.1) { try { await window.seek(t) } catch (e) { out.push(t.toFixed(1) + ': ' + e.message) } } return out })
console.log(bad.length ? bad.slice(0, 15).join('\n') : 'all OK')
await browser.close(); server.close()
