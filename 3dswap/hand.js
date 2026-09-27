// 3D hand skeleton: 21 joints (MediaPipe order), poses stored as joint rotations relative to the parent,
// fixed bone lengths, blended with quaternion slerp (never by position, so fingers keep their length).
// Local frame: wrist at origin, fingers point +Y in the open pose, palm faces -Z (fingers curl toward -Z).
import * as THREE from 'three'

const S = 1 // world units: the whole hand is ~0.55 tall
export const BASES = [ // fixed points relative to the wrist: thumb CMC, then index/middle/ring/pinky MCP
  [-0.10, 0.06, 0.03], [-0.085, 0.27, 0], [-0.02, 0.285, 0], [0.042, 0.27, 0], [0.095, 0.24, 0],
].map((p) => new THREE.Vector3(...p).multiplyScalar(S))
export const LENGTHS = [ // three bones per digit
  [0.13, 0.10, 0.085], [0.13, 0.08, 0.065], [0.145, 0.088, 0.07], [0.135, 0.082, 0.065], [0.105, 0.065, 0.058],
].map((l) => l.map((v) => v * S))
export const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]]

const D = Math.PI / 180
const q = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D, 'ZYX'))
// a pose = per digit [base quaternion, joint2, joint3] (each relative to its parent); curl = negative X (toward palm)
function digit(spread, base, mid, tip, twist = 0) { return [q(-base, twist, spread), q(-mid, 0, 0), q(-tip, 0, 0)] }
function thumb(abduct, oppose, base, mid, tip) { return [q(-base, oppose, abduct), q(-mid, 0, 0), q(-tip, 0, 0)] }
export const POSES = {
  open: [thumb(38, -20, 5, 5, 5), digit(8, 4, 4, 2), digit(1, 3, 3, 2), digit(-6, 4, 4, 2), digit(-13, 6, 5, 3)],
  reach: [thumb(30, -30, 18, 12, 10), digit(6, 18, 14, 10), digit(0, 22, 18, 12), digit(-5, 28, 24, 14), digit(-10, 34, 28, 16)],
  // pinch and three: solved by tools/solve_hand.mjs so the fingertips really touch (gap ≈ joint diameter)
  pinch: [thumb(2.6, 1.9, 38.2, 11.3, 6.4), digit(5.6, 46.1, 63.1, 32.3, 8.8), digit(-1, 40, 55, 30), digit(-5, 55, 70, 40), digit(-9, 60, 75, 42)],
  three: [thumb(-5.8, -0.6, 39.9, 10.4, 6.8), digit(-4, 47.2, 65.2, 28.5, -2.3), digit(0.9, 47.5, 77.3, 20.1, 15), digit(-6, 70, 85, 50), digit(-10, 74, 88, 52)],
  release: [thumb(34, -26, 10, 8, 6), digit(8, 10, 8, 5), digit(1, 10, 9, 5), digit(-6, 12, 10, 6), digit(-13, 14, 12, 7)],
}
// blend a list of [pose, weight] (weights sum to 1) by successive slerp
export function blend(list) {
  let acc = POSES[list[0][0]].map((d) => d.map((x) => x.clone())), w = list[0][1]
  for (let i = 1; i < list.length; i++) {
    const [name, wi] = list[i]
    if (wi <= 0) continue
    const t = wi / (w + wi)
    acc = acc.map((d, di) => d.map((x, ji) => x.clone().slerp(POSES[name][di][ji], t)))
    w += wi
  }
  return acc
}
// forward kinematics: pose -> 21 joint positions in hand-local space
export function joints(pose) {
  const out = [new THREE.Vector3()]
  for (let di = 0; di < 5; di++) {
    let p = BASES[di].clone(), rot = new THREE.Quaternion()
    out.push(p.clone())
    for (let ji = 0; ji < 3; ji++) {
      rot = rot.clone().multiply(pose[di][ji])
      p = p.clone().add(new THREE.Vector3(0, LENGTHS[di][ji], 0).applyQuaternion(rot))
      out.push(p.clone())
    }
  }
  // MediaPipe order has 1..4 = thumb CMC..TIP: our thumb base point is the CMC, which is index 1 -> matches
  return out
}
