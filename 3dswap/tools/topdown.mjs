// node tools/topdown.mjs -> out/topdown.json (camera path sampled from the film itself)
import {chromium} from 'playwright'
import fs from 'node:fs'
import {serve} from './serve.mjs'
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 400, height: 400}})
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 600000})
fs.writeFileSync('out/topdown.json', JSON.stringify(await page.evaluate(() => window.topdown())))
await browser.close(); server.close()
