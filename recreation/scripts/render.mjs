// Renders index.html by calling window.seek(t) for every subframe in headless Chromium.
//
//   node scripts/render.mjs still 3.2   -> out/still.png at t seconds
//   node scripts/render.mjs sheet       -> out/sheet.jpg, one frame per beat (check timing first)
//   node scripts/render.mjs full        -> out/video.mp4, 60fps, SUB subframes blended with tmix
//
// Env: SUB (subframes per frame, default 4), WORKERS (parallel pages, default 4), FPS (default 60)
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'out');
const framesDir = path.join(root, 'tmp', 'frames');
const FPS = Number(process.env.FPS || 60);
const SUB = Number(process.env.SUB || 4);
const WORKERS = Number(process.env.WORKERS || 4);
const W = 1920;
const H = 1080;

const beatsFile = path.join(root, 'audio', 'beats.json');
const grid = fs.existsSync(beatsFile) ? JSON.parse(fs.readFileSync(beatsFile, 'utf8')) : null;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {stdio: 'inherit'});
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function launch() {
  // use the preinstalled Chromium if Playwright's own download is missing
  const opts = {};
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  return chromium.launch(opts);
}

async function openPage(browser) {
  const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  await page.addInitScript(() => {
    window.__RENDER__ = true;
  });
  page.on('pageerror', (e) => console.error('pageerror', e));
  await page.goto('file://' + path.join(root, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  if (grid) await page.evaluate((beat) => window.configure({beat}), grid.beat);
  return page;
}

async function shot(page, t, file, type = 'png') {
  await page.evaluate((tt) => window.seek(tt), t);
  await page.screenshot({path: file, type, ...(type === 'jpeg' ? {quality: 90} : {})});
}

async function main() {
  const mode = process.argv[2] || 'sheet';
  fs.mkdirSync(outDir, {recursive: true});
  const browser = await launch();
  const first = await openPage(browser);
  const tl = await first.evaluate(() => window.timeline());
  console.log(`beat=${tl.beat.toFixed(4)}s beats=${tl.beats} duration=${tl.duration.toFixed(3)}s`);

  if (mode === 'still') {
    const t = Number(process.argv[3] || 0);
    await shot(first, t, path.join(outDir, 'still.png'));
    console.log('wrote out/still.png');
  } else if (mode === 'sheet') {
    const dir = path.join(root, 'tmp', 'sheet');
    fs.rmSync(dir, {recursive: true, force: true});
    fs.mkdirSync(dir, {recursive: true});
    const offset = Number(process.argv[3] ?? 0.6); // sample late in each beat so the state has settled
    for (let b = 0; b < tl.beats; b++) {
      await shot(first, (b + offset) * tl.beat, path.join(dir, `${String(b).padStart(3, '0')}.jpg`), 'jpeg');
    }
    const cols = 6;
    const rows = Math.ceil(tl.beats / cols);
    await run('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%03d.jpg'),
      '-vf', `scale=480:270,drawtext=text='%{n}':x=8:y=8:fontsize=28:fontcolor=red,tile=${cols}x${rows}`,
      '-frames:v', '1', path.join(outDir, 'sheet.jpg')]);
    console.log('wrote out/sheet.jpg (one tile per beat, number = beat)');
  } else if (mode === 'full') {
    fs.rmSync(framesDir, {recursive: true, force: true});
    fs.mkdirSync(framesDir, {recursive: true});
    const frames = Math.round(tl.duration * FPS);
    const total = frames * SUB;
    const pages = [first, ...(await Promise.all(Array.from({length: WORKERS - 1}, () => openPage(browser))))];
    let done = 0;
    const started = Date.now();
    await Promise.all(pages.map(async (page, w) => {
      for (let i = w; i < total; i += WORKERS) {
        // subframes centered on each output frame, so the "shutter" spans one full frame
        const t = (i - (SUB - 1) / 2) / (FPS * SUB);
        await shot(page, Math.max(0, t), path.join(framesDir, `${String(i).padStart(6, '0')}.jpg`), 'jpeg');
        if (++done % 250 === 0) console.log(`subframe ${done}/${total} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
      }
    }));
    console.log(`rendered ${total} subframes in ${((Date.now() - started) / 1000).toFixed(0)}s`);
    const audio = grid && fs.existsSync(path.join(root, grid.source)) ? path.join(root, grid.source) : null;
    await run('ffmpeg', [
      '-v', 'error', '-y', '-framerate', String(FPS * SUB), '-i', path.join(framesDir, '%06d.jpg'),
      // trim the song so its beat 0 lands on video t=0
      ...(audio ? ['-ss', String(grid.start), '-i', audio] : []),
      '-vf', SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)` : 'null',
      '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
      ...(audio ? ['-c:a', 'aac', '-b:a', '192k', '-t', String(tl.duration), '-af', `afade=t=out:st=${tl.duration - 1}:d=1`] : []),
      '-movflags', '+faststart', path.join(outDir, 'video.mp4'),
    ]);
    console.log('wrote out/video.mp4');
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
