# Webcam clip -> eye-locked 4:5 card frames + per-frame head pose.
#   python3 tools/webcam.py            (needs tmp/cam/f###.jpg + tmp/cam/faces.json from YuNet)
# Crop keeps the eye midpoint at (0.5, 0.42) and the eye distance at 0.21 of the width (the avatar
# renders are aligned to the same targets), translation + scale only, so head roll stays in the picture. Pose drives the avatar render.
import json, math, os, glob
import numpy as np, cv2

OUT_W, OUT_H = 640, 800
EYE_Y, EYE_D = 0.42, 0.21
d = json.load(open('tmp/cam/faces.json'))
F = np.array(d['faces'], dtype=float)                      # x y w h  re le  nose  rm lm  (image coords)
eyeA, eyeB, nose, mA, mB = F[:, 4:6], F[:, 6:8], F[:, 8:10], F[:, 10:12], F[:, 12:14]
left = np.where((eyeA[:, 0] < eyeB[:, 0])[:, None], eyeA, eyeB); right = np.where((eyeA[:, 0] < eyeB[:, 0])[:, None], eyeB, eyeA)
mid = (left + right) / 2; ed = np.hypot(*(right - left).T)

def smooth(x, s):
    k = np.exp(-0.5 * (np.arange(-3 * s, 3 * s + 1) / s) ** 2); k /= k.sum()
    p = np.pad(x, [(3 * s, 3 * s)] + [(0, 0)] * (x.ndim - 1), mode='edge')
    return np.stack([np.convolve(p[:, i], k, 'valid') for i in range(x.shape[1])], 1) if x.ndim > 1 else np.convolve(p, k, 'valid')

# head pose (radians, avatar convention: +yaw faces image-right, +pitch faces down, +roll counter-clockwise)
r = (nose[:, 0] - mid[:, 0]) / ed
v = (nose[:, 1] - mid[:, 1]) / ed
yaw = np.arcsin(np.clip(r / 0.8, -0.9, 0.9))
pitch = (v - np.median(v)) / 0.55
roll = -np.arctan2(right[:, 1] - left[:, 1], right[:, 0] - left[:, 0])
pose = smooth(np.stack([yaw, pitch, roll], 1), 2)

midS, edS = smooth(mid, 2), smooth(ed, 3)
src = cv2.imread('tmp/cam/f001.jpg'); H, W = src.shape[:2]
os.makedirs('assets/webcam/before', exist_ok=True)
S_ = (EYE_D * OUT_W) / edS; TX = 0.5 * OUT_W - S_ * midS[:, 0]; TY = EYE_Y * OUT_H - S_ * midS[:, 1]
for i, f in enumerate(sorted(glob.glob('tmp/cam/f*.jpg'))):
    M = np.array([[S_[i], 0, TX[i]], [0, S_[i], TY[i]]])
    im = cv2.warpAffine(cv2.imread(f), M, (OUT_W, OUT_H), flags=cv2.INTER_AREA if S_[i] < 1 else cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite(f'assets/webcam/before/{i:03d}.jpg', im, [cv2.IMWRITE_JPEG_QUALITY, 86])
# landmarks + face box [x0, y0, x1, y1] in card fractions, smoothed so the overlay doesn't jitter
pts = np.stack([left, right, nose, mA, mB], 1) * S_[:, None, None] + np.stack([TX, TY], 1)[:, None, :]
pts = smooth((pts / [OUT_W, OUT_H]).reshape(len(F), -1), 2).reshape(len(F), 5, 2)
box = np.stack([F[:, 0] * S_ + TX, F[:, 1] * S_ + TY, (F[:, 0] + F[:, 2]) * S_ + TX, (F[:, 1] + F[:, 3]) * S_ + TY], 1) / [OUT_W, OUT_H, OUT_W, OUT_H]
box = smooth(box, 3)
track = [{'pts': np.round(pts[i], 4).tolist(), 'box': np.round(box[i], 4).tolist(), 'pose': np.round(pose[i], 4).tolist()} for i in range(len(F))]
json.dump({'fps': 30, 'n': len(track), 'w': OUT_W, 'h': OUT_H, 'frames': track}, open('assets/webcam/track.json', 'w'))
print('frames', len(track), 'yaw deg', np.degrees(pose[:, 0]).min().round(1), np.degrees(pose[:, 0]).max().round(1),
      'pitch', np.degrees(pose[:, 1]).min().round(1), np.degrees(pose[:, 1]).max().round(1),
      'roll', np.degrees(pose[:, 2]).min().round(1), np.degrees(pose[:, 2]).max().round(1), 'scale', S_.min().round(2), S_.max().round(2))
