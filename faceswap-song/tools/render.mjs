// Renders index.html by calling window.seek(t) for every subframe (headless Chromium, SwiftShader WebGL).
//
//   node tools/render.mjs beats          -> out/beats.jpg, one tile per beat (the per-beat check)
//   node tools/render.mjs full           -> out/song-video.mp4: FPS, SUB subframes per frame blended with tmix, + audio/mix.wav
//
// Env: FPS (default 60), SUB (default 4), WORKERS (parallel pages, default 2), FROM/TO (seconds, for partial renders)
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import {spawn} from 'node:child_process'
import {serve} from './serve.mjs'

const root = path.resolve(import.meta.dirname, '..')
const FPS = +(process.env.FPS || 60), SUB = +(process.env.SUB || 4), WORKERS = +(process.env.WORKERS || 2)
const run = (cmd, args) => new Promise((ok, no) => spawn(cmd, args, {stdio: 'inherit'}).on('exit', (c) => (c === 0 ? ok() : no(new Error(`${cmd} exited ${c}`)))))

const {server, url} = await serve()
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']})
async function openPage() {
  const page = await browser.newPage({viewport: {width: 1920, height: 1080}})
  page.on('pageerror', (e) => console.error('pageerror', e.message))
  await page.addInitScript(() => { window.__RENDER__ = true })
  await page.goto(url + '/index.html')
  await page.waitForFunction(() => window.ready, null, {timeout: 600000})
  return page
}
async function shot(page, t, file) {
  const data = await page.evaluate(async (tt) => { await window.seek(tt); return document.querySelector('canvas').toDataURL('image/jpeg', 0.93) }, t)
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'))
}

const mode = process.argv[2] || 'beats' // 'cues' only writes out/cues.json
fs.mkdirSync(path.join(root, 'out'), {recursive: true})
const first = await openPage()
const tl = await first.evaluate(() => window.timeline())
fs.writeFileSync(path.join(root, 'out/cues.json'), JSON.stringify(tl, null, 1))

if (mode === 'beats') {
  const dir = path.join(root, 'tmp/beats'); fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true})
  const n = Math.round(tl.duration / tl.beat)
  for (let i = 0; i < n; i++) await shot(first, (i + 0.5) * tl.beat, path.join(dir, `${String(i).padStart(3, '0')}.jpg`))
  await run('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%03d.jpg'), '-vf', 'scale=180:180,tile=10x12', '-frames:v', '1', path.join(root, 'out/beats.jpg')])
  console.log('wrote out/beats.jpg (tile n = beat n + 0.5)')
} else if (mode === 'full') {
  const framesDir = path.join(root, 'tmp/frames')
  const from = +(process.env.FROM || 0), to = +(process.env.TO || tl.duration)
  if (!process.env.KEEP) fs.rmSync(framesDir, {recursive: true, force: true})
  fs.mkdirSync(framesDir, {recursive: true})
  const total = Math.round(tl.duration * FPS) * SUB
  const pages = [first, ...(await Promise.all(Array.from({length: WORKERS - 1}, openPage)))]
  const todo = []
  for (let i = 0; i < total; i++) {
    const t = (i - (SUB - 1) / 2) / (FPS * SUB) // subframes centred on each output frame: the shutter spans one frame
    const f = path.join(framesDir, `${String(i).padStart(6, '0')}.jpg`)
    if (t >= from - 0.1 && t < to && !fs.existsSync(f)) todo.push([Math.min(Math.max(0, t), tl.duration - 1e-4), f])
  }
  let done = 0; const started = Date.now()
  await Promise.all(pages.map(async (page, w) => {
    for (let k = w; k < todo.length; k += WORKERS) {
      await shot(page, ...todo[k])
      if (++done % 200 === 0) console.log(`subframe ${done}/${todo.length} (${((Date.now() - started) / 1000).toFixed(0)}s)`)
    }
  }))
  console.log(`rendered ${todo.length} subframes in ${((Date.now() - started) / 1000).toFixed(0)}s`)
  const mix = path.join(root, 'audio/song.wav'), audio = fs.existsSync(mix)
  const out = path.join(root, process.env.OUT || 'out/song-video.mp4')
  await run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS * SUB), '-i', path.join(framesDir, '%06d.jpg'), ...(audio ? ['-i', mix] : []),
    '-vf', SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)` : 'null',
    '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
    ...(audio ? ['-c:a', 'aac', '-b:a', '256k', '-t', String(tl.duration)] : []), '-movflags', '+faststart', out])
  console.log('wrote', path.relative(root, out))
}
await browser.close(); server.close()
