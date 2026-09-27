import {chromium} from 'playwright'
import {serve} from './serve.mjs'
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 1440, height: 1440}})
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 90000})
console.log(await page.evaluate(async (t) => { await window.seek(t); return window.__vis() }, (+process.argv[2] - 1) / 2))
await browser.close(); server.close()
