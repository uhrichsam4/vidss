import {chromium} from 'playwright'
import fs from 'node:fs'
import {serve} from './serve.mjs'
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 1440, height: 1440}})
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 90000})
const t = (+process.argv[2] - 1) / 2
console.log(await page.evaluate(async (t) => { await window.seek(t); return window.__cam() }, t))
const d = await page.evaluate(async (t) => { await window.seek(t); return document.querySelector('canvas').toDataURL('image/png') }, t)
fs.writeFileSync('out/nofloor.png', Buffer.from(d.split(',')[1], 'base64'))
await browser.close(); server.close()
