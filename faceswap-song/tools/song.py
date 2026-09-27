# The song (an ad for what the app does): lyrics, melody, an electronic instrumental synthesised in numpy, sung vocals (Kokoro + WORLD), mix.
#   python3 tools/song.py  -> audio/song.wav (+ audio/song.mp3) and audio/song.json (bars, lines, syllable times)
# 128 BPM, A minor, 34 bars (~64 s): intro 2 | verse 8 | pre 2 | chorus 8 | break 4 | chorus 8 | outro 2
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter, resample_poly, fftconvolve
from sing import sing, SR as VSR

SR = 44100; BPM = 128; B = 60 / BPM; BAR = 4 * B; NBARS = 34
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); P = lambda *a: os.path.join(ROOT, *a)
rng = np.random.default_rng(7)
N = int(NBARS * BAR * SR) + SR * 2
sec = lambda b: b * BAR                                  # bar index -> seconds
CH = {'Am': (57, 60, 64), 'F': (53, 57, 60), 'C': (48, 52, 55), 'G': (55, 59, 62), 'Em': (52, 55, 59)}
CHORDS = ['Am', 'G'] + ['Am', 'F', 'C', 'G'] * 2 + ['F', 'G'] + ['F', 'G', 'Am', 'G'] * 2 + ['F', 'C', 'G', 'Am'] + ['F', 'G', 'Am', 'G'] * 2 + ['Am', 'Am']
SECT = [(0, 2, 'intro'), (2, 10, 'verse'), (10, 12, 'pre'), (12, 20, 'chorus'), (20, 24, 'break'), (24, 32, 'chorus2'), (32, 34, 'outro')]
sect = lambda bar: next(n for a, e, n in SECT if a <= bar < e)
# lyrics: (bar, text, [(midi, beats)] one note per syllable)
LYR = [
    (2, 'One photo, that is all it takes,', [(52, 1), (55, .5), (57, 1.5), (55, .5), (57, .5), (55, 1), (53, 3)]),
    (4, 'swap your face, live, on the camera,', [(52, .5), (55, .5), (57, 1), (60, 1), (57, .5), (55, .5), (57, 1), (55, .5), (55, 2.5)]),
    (6, 'thirty frames a second, smooth and clean,', [(52, .5), (55, .5), (57, 1), (57, .5), (60, 1), (57, .5), (55, 1), (55, .5), (53, 2.5)]),
    (8, 'running on your Mac, not a cloud machine.', [(52, .5), (55, .5), (57, .5), (57, .5), (60, 1), (59, .5), (57, .5), (59, 1), (57, .5), (55, 2.5)]),
    (10, 'Double click, pick a face, and start!', [(57, .5), (57, .5), (60, 1), (57, .5), (57, .5), (62, 1), (62, 1), (64, 3)]),
    (12, 'Open your hand, a model appears,', [(60, 1), (60, .5), (62, .5), (64, 1.5), (62, .5), (60, 1), (62, .5), (62, .5), (62, 2)]),
    (14, 'pinch it and it stays, it only turns,', [(60, 1), (60, .5), (62, .5), (64, .5), (60, 1.5), (62, .5), (62, .5), (64, .5), (62, 2.5)]),
    (16, 'two quick pinches, it looks back at you,', [(57, .5), (60, .5), (64, 1), (62, .5), (60, .5), (59, 1), (57, .5), (59, .5), (55, 3)]),
    (18, 'three fingers up, it grows, down, it shrinks.', [(57, 1), (57, .5), (60, .5), (64, 1), (62, .5), (64, 1.5), (60, 1), (59, .5), (57, 1.5)]),
    (20, 'Reach for the shelf, ten models wait,', [(57, 1), (57, .5), (55, .5), (60, 1.5), (59, .5), (57, .5), (55, .5), (52, 3)]),
    (22, 'pinch it, pull it, it fights back, then pops in your hand.', [(52, .5), (55, .5), (57, .5), (57, .5), (60, .5), (59, 1), (57, .5), (55, .5), (57, 1), (59, .5), (57, .5), (57, 1.5)]),
    (24, 'Hands in front of your face,', [(60, 1), (60, .5), (62, .5), (64, 1), (62, 1), (62, 4)]),
    (26, 'the face stays clean, it never glitches,', [(57, .5), (60, .5), (64, 1), (62, 1), (60, .5), (59, 1), (57, .5), (59, .5), (55, 2.5)]),
    (28, 'send it to your calls and O. B. S.,', [(60, .5), (60, .5), (62, .5), (62, .5), (64, 1), (62, .5), (60, 1), (64, 1), (62, 2.5)]),
    (30, 'an A. I. effect tag in the corner.', [(57, .5), (57, .5), (60, .5), (59, .5), (57, .5), (64, 1.5), (62, .5), (60, .5), (59, .5), (57, 2.5)]),
    (32, 'Swap studio.', [(57, 1), (60, 1), (59, 1), (57, 5)]),
]
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): b, a = butter(o, min(0.99, f / (SR / 2))); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, f1, f2): b, a = butter(2, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return lfilter(b, a, x)
def add(buf, x, t, g=1.0):
    i = int(round(t * SR)); j = min(len(buf), i + len(x))
    if j > i >= 0: buf[i:j] += x[: j - i] * g
def env(n, a, d, sus=0.0):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * (sus + (1 - sus) * np.exp(-t / max(d, 1e-4))); return e
# ---------------- drums ----------------
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.28) + 0.3 * np.exp(-t / 0.004) * rng.standard_normal(n) * 0.3
    return np.tanh(2.2 * x) * 0.9
def clap():
    n = int(0.35 * SR); x = np.zeros(n)
    for k, o in enumerate([0, 0.011, 0.022]): i = int(o * SR); m = n - i; x[i:] += rng.standard_normal(m) * np.exp(-np.arange(m) / SR / (0.012 if k < 2 else 0.16))
    return bp(x, 1000, 2600) * 0.6
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (0.09 if open_ else 0.018))
    return hp(x, 8000, 4) * 0.16
def crash():
    n = int(2.4 * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.7); return hp(x, 4000, 2) * 0.28
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / n; x = rng.standard_normal(n)
    out = np.zeros(n); seg = int(0.05 * SR)
    for i in range(0, n, seg):
        f = 400 + 7000 * t[i] ** 2; out[i:i + seg] = bp(x[i:i + seg + 256], f * 0.7, min(f * 1.4, 20000))[:len(out[i:i + seg])]
    return out * t ** 2 * 0.5
# ---------------- tonal ----------------
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; ph = (f * (1 + det) * t + rng.random()) % 1.0; return 2 * ph - 1
def supersaw(notes, n):
    x = np.zeros(n)
    for m in notes:
        for d in (-0.012, -0.006, -0.002, 0.0, 0.002, 0.006, 0.012): x += saw(mtof(m), n, d)
    return x / (7 * len(notes))
def pluck(m, dur):
    n = int(dur * SR); x = saw(mtof(m), n) * 0.6 + np.sign(np.sin(2 * np.pi * mtof(m) * np.arange(n) / SR)) * 0.4
    e = np.exp(-np.arange(n) / SR / 0.16); return lp(x * e, 3500) * 0.5
def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * mtof(m) * t) + 0.35 * np.sign(np.sin(2 * np.pi * mtof(m) * t)); x = lp(x, 700)
    return x * env(n, 0.005, 0.25, 0.7) * np.minimum(1, (n - np.arange(n)) / (0.01 * SR)) * 0.55
# ---------------- arrange ----------------
drums = np.zeros(N); padb = np.zeros(N); bassb = np.zeros(N); plk = np.zeros(N); fx = np.zeros(N)
K, CL, HC, HO, CR = kick(), clap(), hat(), hat(True), crash()
duck = np.ones(N)                                            # sidechain from the kick
for bar in range(NBARS):
    s = sect(bar); t0 = sec(bar); chord = CH[CHORDS[bar]]; root = chord[0] - 24 if chord[0] >= 52 else chord[0] - 12
    full = s in ('chorus', 'chorus2')
    # drums
    if s in ('verse',):
        for b_ in (0, 2): add(drums, K, t0 + b_ * B);
        for b_ in (1, 3): add(drums, CL, t0 + b_ * B, 0.8)
        for e in range(8): add(drums, HC, t0 + e * B / 2, 0.8 if e % 2 else 0.5)
    if full or s == 'pre' and bar == 10:
        for b_ in range(4): add(drums, K, t0 + b_ * B)
        if full:
            for b_ in (1, 3): add(drums, CL, t0 + b_ * B)
            for e in range(8): add(drums, HO if e % 2 else HC, t0 + e * B / 2, 0.55 if e % 2 else 0.6)
    if s == 'pre' and bar == 11:                             # snare roll into the drop
        for k in range(16): add(drums, CL, t0 + k * B / 4, 0.25 + 0.6 * k / 15)
    if full or s in ('verse',) or (s == 'pre' and bar == 10):
        for b_ in range(4):
            if full or b_ % 2 == 0:
                i = int((t0 + b_ * B) * SR); w = int(0.22 * SR); duck[i:i + w] = np.minimum(duck[i:i + w], 0.35 + 0.65 * (np.arange(min(w, N - i)) / w) ** 0.6)
    # pads: every section, brighter in the choruses, dark in the break
    n = int(BAR * SR) + int(0.3 * SR)
    pad = supersaw([m - 12 for m in chord] + [chord[0]], n)
    pad = lp(pad, 5200 if full else 1400 if s in ('break', 'intro', 'outro') else 2200) * env(n, 0.04, 9, 1) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    add(padb, pad, t0, 0.55 if full else 0.75 if s in ('intro', 'break', 'outro') else 0.45)
    # bass
    if s != 'intro' and s != 'break' and s != 'outro':
        if full:
            for e in range(8): add(bassb, bass(root, B / 2 * 0.9), t0 + e * B / 2, 1.0 if e % 2 else 0.6)
        else:
            add(bassb, bass(root, BAR * 0.95), t0, 0.9)
    # plucked arpeggio: 16ths up the chord (intro, verse, break, outro)
    if s in ('intro', 'verse', 'break', 'outro', 'chorus', 'chorus2'):
        arp = [chord[0], chord[1], chord[2], chord[0] + 12, chord[2], chord[1]]
        for k in range(16): add(plk, pluck(arp[k % 6] + (12 if full else 0), B / 4 * 1.6), t0 + k * B / 4, 0.35 if full else 0.5)
# transitions: crash on section starts, riser into each chorus, impact on the drops
for a, e, n_ in SECT:
    if n_ in ('verse', 'chorus', 'chorus2', 'outro'): add(fx, CR, sec(a), 0.9)
for a in (12, 24): add(fx, riser(sec(2)), sec(a - 2), 0.8)
# vocals
vox = np.zeros(N); dbl = np.zeros(N); syll = []
for bar, text, notes in LYR:
    y = sing(text, notes, B); y = resample_poly(y, SR, VSR)
    lead = 0.012                                              # the consonant sits just ahead of the beat
    add(vox, y, sec(bar) - lead)
    if sect(bar) in ('chorus', 'chorus2', 'outro'):
        y2 = sing(text, [(m + 12 if False else m, d) for m, d in notes], B, vib=0.5); y2 = resample_poly(y2, SR, VSR); add(dbl, y2, sec(bar) - lead + 0.018)
    st = np.cumsum([0] + [d for _, d in notes])[:-1] * B
    syll.append({'bar': bar, 't': round(sec(bar), 4), 'text': text, 'notes': [[int(m), float(d)] for m, d in notes], 'syl_t': [round(sec(bar) + x, 4) for x in st]})
    print('sang', bar, text)
def reverb(x, dur=2.2, wet=0.25):
    n = int(dur * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (dur / 5)); ir = lp(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
    return x + wet * fftconvolve(x, ir)[: len(x)]
def delay(x, t, fb=0.3, wet=0.2):
    d = int(t * SR); y = x.copy()
    for k in range(1, 5): y[d * k:] += x[: len(x) - d * k] * wet * fb ** (k - 1)
    return y
voxm = reverb(delay(hp(vox, 90), B * 0.75, 0.35, 0.18), 1.8, 0.22) + 0.35 * reverb(hp(dbl, 140), 2.2, 0.3)
voxm = np.tanh(voxm * 1.6) / 1.6
mixL = drums * 0.8 + (padb * 0.55 + bassb * 0.8 + plk * 0.3) * duck + reverb(fx, 1.5, 0.2) * 0.5 + voxm * 1.7
mixL = reverb(mixL * 0 + (padb * 0.55 + plk * 0.35) * duck, 2.5, 0.35) * 0.35 + mixL
x = mixL[: int(NBARS * BAR * SR + 1.5 * SR)]
x[-int(2.2 * SR):] *= np.linspace(1, 0, int(2.2 * SR)) ** 1.5
st = np.stack([x, x], 1)
# a little width: pads and plucks slightly offset left/right
w = int(0.012 * SR); side = (padb * 0.55 + plk * 0.35)[: len(x)] * duck[: len(x)] * 0.25
st[:, 0] += np.concatenate([np.zeros(w), side[:-w]]); st[:, 1] -= 0.0 * side
st /= np.abs(st).max() * 1.05
os.makedirs(P('audio'), exist_ok=True); raw = P('tmp_song_raw.wav'); sf.write(raw, st, SR, subtype='FLOAT')
import subprocess
s_ = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(s_[s_.rindex('{'): s_.rindex('}') + 1])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", '-ar', str(SR), P('audio/song.wav')], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', P('audio/song.wav'), '-b:a', '192k', P('audio/song.mp3')], check=True)
os.remove(raw)
json.dump({'bpm': BPM, 'bar': BAR, 'bars': NBARS, 'sections': SECT, 'chords': CHORDS, 'lines': syll, 'duration': round(len(x) / SR, 3)}, open(P('audio/song.json'), 'w'), indent=1)
print('song', round(len(x) / SR, 2), 's -> audio/song.wav, audio/song.mp3')
