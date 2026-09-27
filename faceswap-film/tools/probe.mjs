// node tools/probe.mjs 17.3  -> loads the film, seeks to a beat, prints errors and timings
import {chromium} from 'playwright'
import {serve} from './serve.mjs'
const beat = +(process.argv[2] || 1)
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 1440, height: 1440}})
page.on('console', (m) => !/stall|GSUB|GPOS/.test(m.text()) && console.log('console', m.type(), m.text().slice(0, 300)))
page.on('pageerror', (e) => console.log('pageerror', e.message))
await page.addInitScript(() => { window.__RENDER__ = true })
const t0 = Date.now(); await page.goto(url + '/index.html')
await page.waitForFunction(() => window.ready, null, {timeout: 90000}); console.log('ready in', Date.now() - t0, 'ms')
const r = await Promise.race([page.evaluate(async (t) => { const a = performance.now(); await window.seek(t); return 'seek ' + Math.round(performance.now() - a) + 'ms' }, (beat - 1) / 2), new Promise((r) => setTimeout(() => r('TIMEOUT 60s'), 60000))])
console.log(r)
if (r.startsWith('TIMEOUT')) console.log(await page.evaluate(() => window.__pending ? window.__pending() : 'n/a'))
await browser.close(); server.close()
