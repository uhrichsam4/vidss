# Touches measured in the picture, the way the app's gestures.py does (per the film prompt):
#   hand size = |wrist - middle knuckle| in metres x the largest pixels-per-metre among the five palm bones
#   thumb-index gap / hand size < 0.26 for 2 frames starts a touch, > 0.33 for 4 frames ends it
#   middle finger joined: its tip within 0.32 hand sizes of the thumb-index meeting point
# Only inside the file's gesture windows (a fist or a cup also brings fingertips together).
#   python3 tools/touches.py  -> data/touches.json
import json, numpy as np, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(R, 'data/hand_motion.json')))
W, H = d['picture_size']; FPS = d['fps']; N = d['frame_count']
PALM = [(0, 5), (0, 9), (0, 13), (0, 17), (5, 17)]
def hand(i):
    f = d['frames'][i]
    if not f: return None
    h = f[0]; return np.array(h['picture']) * [W, H], np.array(h['metres'])
gap, mid, size, pinchpt = np.full(N, np.nan), np.full(N, np.nan), np.full(N, np.nan), np.full((N, 2), np.nan)
for i in range(N):
    r = hand(i)
    if r is None: continue
    px, m = r
    ppm = max(np.linalg.norm(px[a] - px[b]) / max(1e-6, np.linalg.norm(m[a] - m[b])) for a, b in PALM)
    s = np.linalg.norm(m[0] - m[9]) * ppm
    meet = (px[4] + px[8]) / 2
    size[i] = s; gap[i] = np.linalg.norm(px[4] - px[8]) / s; mid[i] = np.linalg.norm(px[12] - meet) / s; pinchpt[i] = meet
win = [(round(w['from'] * FPS), round(w['to'] * FPS), w['doing']) for w in d['what_the_hand_is_doing']]
zt = d['zoom_touch']; win.append((round((zt['fingertips_met'] - 0.4) * FPS), round((zt['let_go'] + 0.4) * FPS), 'zoom touch'))
for t in d['double_taps']: win.append((round((t['first_tap'][0] - 0.3) * FPS), round((t['second_tap'][1] + 0.3) * FPS), 'double tap'))
touches = []
for a, b, what in win:
    if what.startswith(('open', 'relaxed', 'fist', 'holding')): continue
    on, run, start = False, 0, None
    for i in range(max(a - 15, 0), min(b + 60, N)):
        g = gap[i]
        if np.isnan(g): run = 0; continue
        if not on:
            run = run + 1 if g < 0.26 else 0
            if run >= 2: on, start, run = True, i - 1, 0
        else:
            run = run + 1 if g > 0.33 else 0
            if run >= 4: touches.append({'what': what, 'start_f': start, 'end_f': i - 3}); on, run = False, 0
    if on: touches.append({'what': what, 'start_f': start, 'end_f': None})
# dedupe (windows overlap)
seen, T = set(), []
for t in sorted(touches, key=lambda t: t['start_f']):
    if t['start_f'] in seen: continue
    seen.add(t['start_f']); t['start_s'] = round(t['start_f'] / FPS, 3); t['end_s'] = t['end_f'] and round(t['end_f'] / FPS, 3)
    if t['end_f']: t['dur_s'] = round((t['end_f'] - t['start_f']) / FPS, 3)
    js = [i for i in range(t['start_f'], (t['end_f'] or t['start_f'] + 30)) if mid[i] < 0.32]
    if js: t['middle_joined_f'] = js[0]; t['middle_joined_s'] = round(js[0] / FPS, 3)
    T.append(t)
# zoom pump peaks: pinch point height while three fingers touch, after the pump starts
zoom = next(t for t in T if 'middle_joined_f' in t and t['dur_s'] > 2)
f0, f1 = zoom['middle_joined_f'], zoom['end_f']
y = pinchpt[f0:f1, 1] / H
from scipy.signal import find_peaks
ys = np.convolve(np.pad(y, 3, mode='edge'), np.ones(7) / 7, 'valid')
hi, _ = find_peaks(-ys, prominence=0.015); lo, _ = find_peaks(ys, prominence=0.015)
out = {'touches': T, 'zoom': {'fingertips_met_f': zoom['start_f'], 'middle_joined_f': f0, 'let_go_f': f1,
       'pump_top_f': [int(f0 + k) for k in hi], 'pump_bottom_f': [int(f0 + k) for k in lo],
       'pump_top_s': [round((f0 + k) / FPS, 2) for k in hi], 'pump_bottom_s': [round((f0 + k) / FPS, 2) for k in lo]},
       'hand_size_px_median': float(np.nanmedian(size))}
json.dump(out, open(os.path.join(R, 'data/touches.json'), 'w'), indent=1)
for t in T: print(t)
print(out['zoom'])
