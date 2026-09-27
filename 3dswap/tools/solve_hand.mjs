// Finds thumb/finger angles so the fingertips really meet (pinch: thumb+index, three: thumb+index+middle).
import * as THREE from 'three'
import {LENGTHS, BASES} from '../hand.js'
const D = Math.PI / 180
const q = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D, 'ZYX'))
function tip(di, a) { // a = [spreadOrAbduct, twistOrOppose, base, mid, tip]
  const rs = [q(-a[2], a[1], a[0]), q(-a[3], 0, 0), q(-a[4], 0, 0)]
  let p = BASES[di].clone(), rot = new THREE.Quaternion()
  for (let j = 0; j < 3; j++) { rot = rot.clone().multiply(rs[j]); p.add(new THREE.Vector3(0, LENGTHS[di][j], 0).applyQuaternion(rot)) }
  return p
}
const RANGES = { thumb: [[-70, 40], [-120, 60], [0, 75], [0, 70], [0, 60]], finger: [[-12, 12], [-15, 15], [0, 85], [0, 95], [0, 70]] }
function solve(digits, seed) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const init = digits.map((d) => (d === 0 ? [-60 + rnd() * 90, -100 + rnd() * 130, rnd() * 60, rnd() * 50, rnd() * 40] : [rnd() * 16 - 8, 0, 20 + rnd() * 50, 20 + rnd() * 60, rnd() * 50]))
  const cost = (P) => {
    const tips = digits.map((d, k) => tip(d, P[k]))
    let c = 0
    for (let i = 0; i < tips.length; i++) for (let j = i + 1; j < tips.length; j++) c += Math.max(0, tips[i].distanceTo(tips[j]) - 0.012) ** 2
    // stay natural: small preference for moderate curl, tips in front of the palm
    for (let k = 0; k < P.length; k++) c += 1e-9 * P[k].reduce((a, v) => a + v * v, 0) + Math.max(0, tips[k].z + 0.04) ** 2
    return c
  }
  let best = init, bc = cost(best), step = 20
  for (let it = 0; it < 12000; it++) {
    const cand = best.map((a, k) => a.map((v, i) => { const r = RANGES[digits[k] === 0 ? 'thumb' : 'finger'][i]; return Math.min(r[1], Math.max(r[0], v + (rnd() - 0.5) * step)) }))
    const c = cost(cand)
    if (c < bc) { best = cand; bc = c }
    if (it % 2000 === 1999) step *= 0.5
  }
  const tips = digits.map((d, k) => tip(d, best[k]))
  return { best: best.map((a) => a.map((v) => Math.round(v * 10) / 10)), gaps: tips.slice(1).map((t) => t.distanceTo(tips[0]).toFixed(4)) }
}
for (const [name, digs] of [['pinch', [0, 1]], ['three', [0, 1, 2]]]) {
  let best = null
  for (let seed = 1; seed < 40; seed++) { const r = solve(digs, seed * 7919); const g = Math.max(...r.gaps.map(Number)); if (!best || g < best.g) best = { ...r, g } }
  console.log(name, JSON.stringify(best))
}
