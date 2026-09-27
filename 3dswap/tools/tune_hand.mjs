import {POSES, joints, blend} from '../hand.js'
for (const name of Object.keys(POSES)) {
  const j = joints(POSES[name])
  const d = (a, b) => j[a].distanceTo(j[b]).toFixed(3)
  console.log(name.padEnd(8), 'thumb-index', d(4, 8), 'thumb-middle', d(4, 12), 'index-middle', d(8, 12), 'tip4', j[4].toArray().map((v) => v.toFixed(3)).join(','), 'tip8', j[8].toArray().map((v) => v.toFixed(3)).join(','))
}
const mid = joints(blend([['open', 0.5], ['pinch', 0.5]]))
console.log('bone lengths preserved:', mid[6].distanceTo(mid[5]).toFixed(4), '(index proximal should be 0.130)')
