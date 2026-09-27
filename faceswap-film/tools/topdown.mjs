// node tools/topdown.mjs -> out/campath.json (camera position, target and fov every eighth of a beat)
import {chromium} from 'playwright'
import fs from 'node:fs'
import {serve} from './serve.mjs'
const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
const page = await browser.newPage({viewport: {width: 1440, height: 1440}})
await page.addInitScript(() => { window.__RENDER__ = true })
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.ready, null, {timeout: 90000})
fs.writeFileSync('out/campath.json', JSON.stringify(await page.evaluate(() => window.__camPath())))
await browser.close(); server.close()
