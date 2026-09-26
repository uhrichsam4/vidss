// Injected before any page script: replaces the page's clocks with a virtual one so a game can be
// stepped frame by frame (deterministic, smooth capture no matter how slow the screenshot is).
// window.__advance(ms) moves time forward, fires due timers in order, then runs one animation frame.
(() => {
  let now = 0
  const epoch = Date.now()
  const raf = []
  let rafId = 0
  const timers = new Map()
  let tid = 0
  performance.now = () => now
  Date.now = () => epoch + now
  window.requestAnimationFrame = (cb) => { raf.push([++rafId, cb]); return rafId }
  window.cancelAnimationFrame = (id) => { const i = raf.findIndex((r) => r[0] === id); if (i >= 0) raf.splice(i, 1) }
  window.setTimeout = (cb, ms = 0, ...a) => { const id = ++tid; timers.set(id, { at: now + Math.max(0, +ms || 0), cb, a }); return id }
  window.setInterval = (cb, ms = 0, ...a) => { const id = ++tid; const every = Math.max(1, +ms || 0); timers.set(id, { at: now + every, cb, a, every }); return id }
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id)
  const run = (f, a = []) => { try { typeof f === 'function' ? f(...a) : null } catch (e) { console.error(e) } }
  window.__advance = (dt) => {
    const target = now + dt
    for (let guard = 0; guard < 10000; guard++) {
      let next = null
      for (const [id, t] of timers) if (t.at <= target && (!next || t.at < next[1].at)) next = [id, t]
      if (!next) break
      const [id, t] = next
      now = Math.max(now, t.at)
      if (t.every) t.at += t.every; else timers.delete(id)
      run(t.cb, t.a)
    }
    now = target
    const cbs = raf.splice(0)
    for (const [, cb] of cbs) run(cb, [now])
  }
})()
