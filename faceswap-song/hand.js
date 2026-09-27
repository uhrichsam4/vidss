// The maker's real hand (data/hand_motion.json), turned into lookup tables once on load.
// picture: the tracker's 2D joints of frame i, in picture pixels, never interpolated (the dots over the clip).
// metres:  the 3D hand as (x, -y, -z), rebuilt from bone directions with fixed bone lengths (the median over the file),
//          smoothed once with a centred 5-frame Gaussian, interpolated between frames by slerping bone directions.
import * as THREE from 'three'

export const PALM_J = [0, 5, 9, 13, 17]
const PALM_BONES = [[0, 5], [0, 9], [0, 13], [0, 17], [5, 17]]

export async function loadHand(url) {
  const d = await (await fetch(url)).json()
  const [PW, PH] = d.picture_size, N = d.frame_count, FPS = d.fps
  const BONES = d.bones                                         // for drawing (includes the palm edge 0-17)
  const TREE = BONES.filter(([a, b]) => !(a === 0 && b === 17))  // forward kinematics: every joint has one parent
  const has = d.frames.map((f) => !!f)
  const pic = d.frames.map((f) => f && f[0].picture.map(([x, y]) => [x * PW, y * PH]))
  const raw = d.frames.map((f) => f && f[0].metres.map(([x, y, z]) => new THREE.Vector3(x, -y, -z)))
  // fixed bone lengths: median over every frame that has the hand
  const len = TREE.map(([a, b]) => { const v = raw.filter(Boolean).map((m) => m[a].distanceTo(m[b])).sort((p, q) => p - q); return v[v.length >> 1] })
  const dirs = raw.map((m) => m && TREE.map(([a, b]) => m[b].clone().sub(m[a]).normalize()))
  const g = [1, 2, 3, 2, 1].map((_, k) => Math.exp(-0.5 * (k - 2) ** 2))   // centred 5-frame Gaussian (sigma 1 frame)
  const sdirs = dirs.map((ds, i) => ds && ds.map((_, b) => {
    const v = new THREE.Vector3()
    for (let k = -2; k <= 2; k++) { const o = dirs[i + k]; if (o) v.addScaledVector(o[b], g[k + 2]) }
    return v.normalize()
  }))
  const rootOf = raw.map((m) => m && m[0].clone())
  const build = (ds, root) => { const p = new Array(21); p[0] = root.clone(); TREE.forEach(([a, b], k) => { p[b] = p[a].clone().addScaledVector(ds[k], len[k]) }); return p }
  const met = sdirs.map((ds, i) => ds && build(ds, rootOf[i]))
  const palmOf = (p) => PALM_J.reduce((s, j) => s.add(p[j]), new THREE.Vector3()).multiplyScalar(1 / 5)
  // largest picture-pixels-per-metre among the five palm bones (raw tracker metres, as the app measures)
  const ppm = raw.map((m, i) => m && Math.max(...PALM_BONES.map(([a, b]) => Math.hypot(pic[i][a][0] - pic[i][b][0], pic[i][a][1] - pic[i][b][1]) / Math.max(1e-6, m[a].distanceTo(m[b])))))
  const palmPx = pic.map((p) => p && PALM_J.reduce((s, j) => [s[0] + p[j][0] / 5, s[1] + p[j][1] / 5], [0, 0]))
  const nearest = (i) => { for (let k = 0; k < N; k++) { if (has[i - k]) return i - k; if (has[i + k]) return i + k } return -1 }

  return {
    N, FPS, PW, PH, BONES, has, pic, palmPx, ppm, nearest,
    frameOf: (c) => Math.min(N - 1, Math.max(0, Math.floor(c * FPS + 1e-6))),   // the clip frame showing at clip time c
    // 3D joints at clip time c, centred on the palm, slerping bone directions between the two frames around c
    metresAt(c) {
      const f = c * FPS - 0.5, i0 = nearest(Math.max(0, Math.min(N - 1, Math.floor(f)))), i1 = nearest(Math.max(0, Math.min(N - 1, Math.floor(f) + 1)))
      const a = sdirs[i0], b = sdirs[i1], w = i0 === i1 ? 0 : Math.min(1, Math.max(0, f - Math.floor(f)))
      const q = new THREE.Quaternion()
      const ds = a.map((da, k) => { q.setFromUnitVectors(da, b[k]); return da.clone().applyQuaternion(new THREE.Quaternion().slerp(q, w)) })
      const p = build(ds, new THREE.Vector3()), pc = palmOf(p)
      return p.map((v) => v.sub(pc))
    },
    metresFrame(i) { const p = met[nearest(i)].map((v) => v.clone()), pc = palmOf(p); return p.map((v) => v.sub(pc)) },
    medianPpm(c0, c1) { const v = []; for (let i = Math.floor(c0 * FPS); i <= Math.ceil(c1 * FPS); i++) if (ppm[i]) v.push(ppm[i]); v.sort((p, q) => p - q); return v[v.length >> 1] },
    boneLen: len,
  }
}
