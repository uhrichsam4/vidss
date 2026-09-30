# data/lyrics.txt (one sung line per row, in order) + the clip's audio -> data/timing.json
#   beats from the song, phrases from the vocal energy, each syllable (pyphen) placed on a vocal onset in its phrase,
#   background frames cut on bar lines (flat black / soft white), fast flips on the last line.
import json, re, numpy as np, librosa, pyphen
CLIP_START = 6.41                                              # song time of clip time 0 (3 s before the first word, on a beat)
y, sr = librosa.load('src/clip.wav', sr=22050); D = len(y) / sr
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time', tightness=200)
per = float(np.median(np.diff(beats))); b0 = beats[0] - per * np.floor(beats[0] / per)
grid = np.arange(b0, D, per)                                  # a steady beat grid through the detected beats
h, _ = librosa.effects.hpss(y, margin=3.0)
S = np.abs(librosa.stft(h, hop_length=256)); f = librosa.fft_frequencies(sr=sr); tt = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=256)
e = S[(f > 250) & (f < 3500)].mean(0); es = np.convolve(e, np.ones(25) / 25, 'same'); on = es > np.percentile(es, 35)
segs, st = [], None
for i, v in enumerate(on):
    if v and st is None: st = tt[i]
    if not v and st is not None:
        if tt[i] - st > 0.35: segs.append([st, tt[i]])
        st = None
ph = []
for a, b in segs:
    if ph and a - ph[-1][1] < 0.45: ph[-1][1] = b
    else: ph.append([a, b])
ph = [p for p in ph if p[1] - p[0] > 1.0]                      # sung lines, not breaths
flux = librosa.onset.onset_strength(y=h, sr=sr, hop_length=256)
lines_txt = [l.strip() for l in open('data/lyrics.txt') if l.strip()]
dic = pyphen.Pyphen(lang='en_US')
lines = []
for k, txt in enumerate(lines_txt):
    a, b = ph[min(k, len(ph) - 1)]
    syl = []
    for wi, w in enumerate(txt.split()):
        parts = dic.inserted(w).split('-')
        for pi, p in enumerate(parts): syl.append({'s': p, 'space': pi == 0 and wi > 0, 'wordEnd': pi == len(parts) - 1})
    n = len(syl); m = (tt >= a - 0.05) & (tt <= b - 0.15); idx = np.where(m)[0]
    # the n strongest onsets in the phrase, at least 110 ms apart, in order; the first syllable at the phrase start
    cand = sorted(idx, key=lambda i: -flux[i]); pick = [idx[0]]
    for i in cand:
        if len(pick) >= n: break
        if all(abs(tt[i] - tt[j]) > 0.11 for j in pick): pick.append(i)
    times = sorted(tt[pick].tolist())
    while len(times) < n: times = sorted(times + [float(np.interp(len(times) / n, [0, 1], [a, b]))])
    for s, t_ in zip(syl, times): s['t'] = round(t_, 3)
    lines.append({'t': round(a, 3), 'text': txt, 'syl': syl})
for k, L in enumerate(lines): L['end'] = round(lines[k + 1]['t'] - 0.05 if k + 1 < len(lines) else D, 3)
# frames: flat black / soft white, cut on bar lines; a new line forces a cut on its downbeat; the last line flips on every beat
bar = per * 4; cuts = [0.0] + [float(x) for x in np.arange(b0 + bar * 0.5, D, bar)]
for L in lines: cuts.append(float(grid[np.argmin(np.abs(grid - L['t']))]))
last = lines[-1]['t'] if lines else D
cuts = sorted(set(round(c, 3) for c in cuts if c < last - 0.1)) + [round(x, 3) for x in grid if x >= last - 0.1] + [round(x, 3) for x in np.arange(grid[-4], D, per / 2)]
cuts = sorted(set(cuts))
pattern = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
frames = [{'t': c, 'dark': bool(pattern[i % len(pattern)]) if c < last - 0.1 else i % 2 == 0, 'i': i} for i, c in enumerate(cuts)]
frames[0]['dark'] = True
ph = [[round(float(a), 3), round(float(b), 3)] for a, b in ph]
json.dump({'duration': round(D, 3), 'tempo': float(np.atleast_1d(tempo)[0]), 'beat': per, 'grid0': float(b0), 'phrases': ph, 'lines': lines, 'frames': frames}, open('data/timing.json', 'w'), indent=1)
print('tempo', round(float(np.atleast_1d(tempo)[0]), 1), 'phrases', len(ph), 'lines', len(lines), 'frames', len(frames))
for L in lines: print(f"{L['t']:6.2f}  {L['text']}  | " + ' '.join(f"{s['s']}@{s['t']:.2f}" for s in L['syl']))
