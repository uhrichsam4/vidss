// node tools/render.mjs -> out/lyric-video.mp4 (1440x1080, FPS default 60, with src/clip.wav)
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import {spawn} from 'node:child_process'
import {serve} from './serve.mjs'
const root = path.resolve(import.meta.dirname, '..'), FPS = +(process.env.FPS || 60), WORKERS = 3
const dir = path.join(root, 'tmp/frames'); fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true})
const {server, url} = await serve()
const browser = await chromium.launch()
const pages = await Promise.all([...Array(WORKERS)].map(async () => { const p = await browser.newPage({viewport: {width: 1440, height: 1080}}); p.on('pageerror', (e) => console.error(e.message)); await p.addInitScript(() => { window.__RENDER__ = true }); await p.goto(url + '/index.html'); await p.waitForFunction(() => window.ready); return p }))
const D = await pages[0].evaluate(() => window.timeline().duration), N = Math.floor(D * FPS), t0 = Date.now()
await Promise.all(pages.map(async (p, w) => { for (let i = w; i < N; i += WORKERS) { const d = await p.evaluate(async (t) => { await window.seek(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95) }, i / FPS); fs.writeFileSync(path.join(dir, `${String(i).padStart(5, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64')) } }))
console.log('frames', N, 'in', ((Date.now() - t0) / 1000).toFixed(0) + 's')
await browser.close(); server.close()
fs.mkdirSync(path.join(root, 'out'), {recursive: true})
await new Promise((ok, no) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'), '-i', path.join(root, 'src/clip.wav'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(root, 'out/lyric-video.mp4')], {stdio: 'inherit'}).on('exit', (c) => (c ? no(c) : ok())))
console.log('wrote out/lyric-video.mp4')
