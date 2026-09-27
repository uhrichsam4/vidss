# tmp/avatar/###.png (transparent avatar renders) -> assets/webcam/after/###.jpg, eyes on the same targets as the
# webcam crop (tools/webcam.py), on the card's near-black backdrop.   python3 tools/avatar_align.py
import glob, json, os
import numpy as np, cv2

OUT_W, OUT_H, EYE_Y, EYE_D = 640, 800, 0.42, 0.21
BG = np.array([13, 12, 14], float)                          # BGR of the old after-portrait backdrop
fs = sorted(glob.glob('tmp/avatar/*.png'))
first = cv2.imread(fs[0], cv2.IMREAD_UNCHANGED); h, w = first.shape[:2]
det = cv2.FaceDetectorYN.create('tools/models/yunet.onnx', '', (w, h), 0.5)

def flat(im, bg):
    a = im[:, :, 3:4] / 255.0
    return (im[:, :, :3] * a + bg * (1 - a)).astype(np.uint8)

mids, eds, ims = [], [], []
for f in fs:
    im = cv2.imread(f, cv2.IMREAD_UNCHANGED); ims.append(im)
    _, faces = det.detect(flat(im, np.array([110, 110, 110.])))
    if faces is None: mids.append(None); eds.append(None); continue
    fa = faces[np.argmax(faces[:, 2] * faces[:, 3])]
    a, b = fa[4:6], fa[6:8]
    mids.append((a + b) / 2); eds.append(float(np.hypot(*(a - b))))
ok = [i for i, m in enumerate(mids) if m is not None]
print('detected', len(ok), '/', len(fs))
idx = np.arange(len(fs))
mid = np.stack([np.interp(idx, ok, [mids[i][k] for i in ok]) for k in (0, 1)], 1)
ed = np.interp(idx, ok, [eds[i] for i in ok])
def smooth(x, s):
    k = np.exp(-0.5 * (np.arange(-3 * s, 3 * s + 1) / s) ** 2); k /= k.sum()
    return np.convolve(np.pad(x, 3 * s, mode='edge'), k, 'valid')
mid = np.stack([smooth(mid[:, 0], 3), smooth(mid[:, 1], 3)], 1)
ed = np.full(len(fs), np.median(ed))                        # one scale for the whole clip: the model doesn't change size
os.makedirs('assets/webcam/after', exist_ok=True)
for i, f in enumerate(fs):
    s = EYE_D * OUT_W / ed[i]
    M = np.array([[s, 0, 0.5 * OUT_W - s * mid[i, 0]], [0, s, EYE_Y * OUT_H - s * mid[i, 1]]])
    im = cv2.warpAffine(ims[i], M, (OUT_W, OUT_H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    cv2.imwrite(f'assets/webcam/after/{os.path.basename(f)[:-4]}.jpg', flat(im, BG), [cv2.IMWRITE_JPEG_QUALITY, 86])
print('scale', round(float(EYE_D * OUT_W / ed[0]), 3))
