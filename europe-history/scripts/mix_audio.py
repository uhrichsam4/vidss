"""Score for the Europe history video, synthesized with numpy and keyed to the page's chapters and cues.

usage: python3 scripts/mix_audio.py      (needs out/cues.json: `node scripts/render.mjs cues`)

Mood follows the story: light pulse (1400) -> typewriter groove (printing) -> driving drums (oceans)
-> drums drop out, low drone (Americas, slavery) -> sparkle (science) -> mechanical beat (industry)
-> tense ostinato (Africa) -> brighter chords (independence) -> stabs and a final chord (legacy).
"""
import json
import os
import wave

import numpy as np

SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(64)


def T(dur):
    return np.arange(int(SR * dur)) / SR


def env(t, a, d):
    return np.clip(t / a, 0, 1) * np.exp(-np.maximum(0, t - a) / d)


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def smooth_fir(x, fc):
    n = max(3, int(SR / fc))
    k = np.hanning(n)
    return np.convolve(x, k / k.sum(), mode='same')


def highpass(x, fc):
    return x - smooth_fir(x, fc)


def place(mix, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= len(mix) or len(x) == 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    j = min(len(mix), i + len(x))
    x = x[: j - i]
    if x.ndim == 1:
        a = (pan + 1) * np.pi / 4
        mix[i:j, 0] += x * gain * np.cos(a)
        mix[i:j, 1] += x * gain * np.sin(a)
    else:
        mix[i:j] += x * gain


# ---------- drums ----------
def kick():
    t = T(0.4)
    f = 48 + 120 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.001, 0.14) + 0.3 * np.sin(2 * np.pi * 2200 * t) * env(t, 0.0003, 0.003)


def clap():
    t = T(0.3)
    n = highpass(rng.standard_normal(len(t)), 900)
    bursts = sum(env(np.maximum(0, t - k * 0.011), 0.0005, 0.006) * (t >= k * 0.011) for k in range(3))
    return n * (bursts * 0.6 + env(t, 0.001, 0.07))


def hat(open_=False):
    t = T(0.25 if open_ else 0.06)
    return highpass(rng.standard_normal(len(t)), 6000) * env(t, 0.0005, 0.08 if open_ else 0.012)


def snare():
    t = T(0.25)
    return highpass(rng.standard_normal(len(t)), 1500) * env(t, 0.001, 0.06) + 0.5 * np.sin(2 * np.pi * 190 * t) * env(t, 0.001, 0.05)


# ---------- synths ----------
def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def supersaw(freq, dur, cutoff=2500):
    t = T(dur)
    x = sum(saw(freq * (1 + d), t + rng.uniform(0, 1)) for d in (-0.008, -0.003, 0, 0.004, 0.009)) / 5
    return smooth_fir(x, cutoff)


def pad(notes, dur, cutoff=1800):
    t = T(dur)
    x = sum(supersaw(note(m), dur, cutoff) for m in notes)
    fade = 0.25
    return x * np.minimum(1, t / fade) * np.minimum(1, (dur - t) / fade)


def pluck(freq, dur=0.35):
    t = T(dur)
    x = saw(freq, t) * 0.6 + np.sin(2 * np.pi * freq * t)
    return smooth_fir(x, 3000) * env(t, 0.002, 0.09)


def bass(freq, dur):
    t = T(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.tanh(3 * np.sin(2 * np.pi * freq * t))
    return x * np.minimum(1, t / 0.005) * np.minimum(1, (dur - t) / 0.02)


def stab(notes):
    t = T(0.45)
    x = sum(supersaw(note(m), 0.45, 4000) for m in notes)
    return x * env(t, 0.002, 0.16)


# ---------- UI sfx ----------
def sweep(dur, f0, f1, shape=1.5):
    """Filtered-noise sweep (whoosh / riser). Brightness moves f0 -> f1 by blending two smoothings."""
    t = T(dur)
    n = rng.standard_normal(len(t))
    lo, hi = smooth_fir(n, max(f0, 80)), smooth_fir(n, max(f1, 80))
    p = t / dur
    x = highpass(lo * (1 - p) + hi * p, 150)
    return x * np.sin(np.pi * p) ** shape


def riser(dur):
    t = T(dur)
    n = sweep(dur, 400, 7000, 0.6) * (t / dur) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / dur) ** 2) / SR) * (t / dur) ** 3 * 0.3
    return n + tone


def boom(dur=2.2, f_hi=126, f_lo=36):
    t = T(dur)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.003, 0.6) + smooth_fir(rng.standard_normal(len(t)), 500) * env(t, 0.002, 0.25) * 0.8


def click(f=2400):
    t = T(0.05)
    return np.sin(2 * np.pi * f * t) * env(t, 0.0004, 0.006) + 0.5 * highpass(rng.standard_normal(len(t)), 3000) * env(t, 0.0003, 0.002)


def keytap():
    t = T(0.04)
    f = rng.uniform(1800, 3200)
    return (np.sin(2 * np.pi * f * t) * env(t, 0.0003, 0.004) + 0.6 * highpass(rng.standard_normal(len(t)), 2500) * env(t, 0.0002, 0.003))


def popsfx():
    t = T(0.14)
    f = 500 + 900 * (1 - np.exp(-t / 0.018))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.002, 0.04)


def success():
    out = np.zeros(int(SR * 0.7))
    for i, m in enumerate([84, 88, 91]):
        t = T(0.7 - i * 0.07)
        x = (np.sin(2 * np.pi * note(m) * t) + 0.2 * np.sin(2 * np.pi * note(m) * 2 * t)) * env(t, 0.002, 0.18)
        s = int(i * 0.07 * SR)
        out[s:s + len(x)] += x
    return out


def bell(freq, dur=2.5):
    t = T(dur)
    return sum(a * np.sin(2 * np.pi * freq * r * t) * env(t, 0.002, d) for r, a, d in [(1, 1, 1.2), (2.76, 0.4, 0.5), (5.4, 0.2, 0.25)])


def chime():
    t = T(2.5)
    return sum(a * np.sin(2 * np.pi * note(m) * r * t) * env(t, 0.002, d) for m in (88, 95) for r, a, d in [(1, 1, 1.0), (2.76, 0.3, 0.4)])


def toggle():
    t = T(0.09)
    thunk = np.sin(2 * np.pi * (700 + 500 * np.exp(-t / 0.01)) * t) * env(t, 0.001, 0.02)
    c = click(2600)
    thunk[: len(c)] += c
    return thunk


def reverb_ir(dur=1.8):
    t = T(dur)
    ir = np.stack([smooth_fir(rng.standard_normal(len(t)), 6000) for _ in range(2)], 1) * np.exp(-t / 0.4)[:, None]
    ir[: int(0.01 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(0))


def convolve(x, ir):
    size = 1 << (len(x) + len(ir) - 1).bit_length()
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], size) * np.fft.rfft(ir[:, c], size), size)[: len(x)] for c in range(2)], 1)


def write_wav(path, data):
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def main():
    data = json.load(open(os.path.join(root, 'out/cues.json')))
    dur, Bt = data['duration'], data['beat']
    ch = {c['id']: (c['t0'], c['t1']) for c in data['chapters']}
    n = int(SR * (dur + 0.05))
    drums, music, sfx = (np.zeros((n, 2)) for _ in range(3))
    beats = lambda a, z: [a + k * Bt for k in range(int(round((z - a) / Bt)))]

    def chord_bed(notes, a, z, gain, cutoff=1600):
        place(music, pad(notes, z - a + 0.3, cutoff), a, gain)

    Am, F, C, G, Dm, E = [45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62], [38, 57, 62, 65], [40, 56, 59, 64]
    # 1400: soft bed
    a, z = ch['divided']; chord_bed(Am, a, z, 0.05, 900)
    # printing: typewriter groove
    a, z = ch['print']; chord_bed(F, a, z, 0.04)
    for k, t in enumerate(beats(a, z)):
        place(drums, kick(), t, 0.8 if k % 2 == 0 else 0.5)
        for s in range(4): place(drums, keytap(), t + s * Bt / 4, 0.18 if s % 2 else 0.1, pan=0.3 * (1 if s % 2 else -1))
        place(music, bass(note(41 - 12 + (7 if k % 4 == 3 else 0)), Bt * 0.45), t, 0.22)
    # oceans: driving drums
    a, z = ch['oceans']; chord_bed(C, a, a + (z - a) / 2, 0.045); chord_bed(G, a + (z - a) / 2, z, 0.045)
    for k, t in enumerate(beats(a, z)):
        place(drums, kick(), t, 0.9)
        if k % 2: place(drums, clap(), t, 0.3)
        for s in range(2): place(drums, hat(), t + s * Bt / 2, 0.14)
        r = 48 if t < a + (z - a) / 2 else 43
        place(music, bass(note(r - 12), Bt * 0.45), t, 0.25); place(music, bass(note(r), Bt * 0.2), t + Bt * 0.75, 0.14)
        m = [67, 72, 76, 79][k % 4]; place(music, pluck(note(m)), t + Bt / 2, 0.05, pan=0.3)
    # Americas + slavery: drums out, low drone, slow heartbeat
    for key, notes in (('americas', Dm), ('slavery', E)):
        a, z = ch[key]; chord_bed(notes, a, z, 0.06, 700)
        place(music, bass(note(notes[0] - 12), z - a) * np.exp(-T(z - a) / 20), a, 0.12)
        for k, t in enumerate(beats(a, z)):
            if k % 2 == 0: place(drums, boom(0.5, 70, 40), t, 0.25 if key == 'slavery' else 0.15)
            if k % 4 == 2: place(music, bell(note(notes[2] + 12), 2.0), t, 0.025)
    # science: sparkle arpeggio
    a, z = ch['science']; chord_bed([45, 57, 64, 71], a, z, 0.045, 2500)
    for k, t in enumerate(beats(a, z)):
        for s in range(4): place(music, pluck(note([76, 81, 83, 88][(k * 4 + s) % 4])), t + s * Bt / 4, 0.03, pan=np.sin(k + s))
        if k >= 4: place(drums, hat(), t + Bt / 2, 0.1)
    # industry: mechanical beat
    a, z = ch['industry']; chord_bed(Am, a, z, 0.04, 1200)
    for k, t in enumerate(beats(a, z)):
        place(drums, kick(), t, 1.0)
        place(drums, click(900) * 3, t + Bt / 2, 0.08)   # metallic clank
        place(drums, hat(open_=True), t + Bt / 2, 0.1)
        if k % 2: place(drums, snare(), t, 0.35)
        place(music, bass(note(33), Bt * 0.3), t, 0.3); place(music, bass(note(33), Bt * 0.2), t + Bt / 2, 0.2)
    # Africa: tense ostinato
    a, z = ch['africa']; chord_bed(Dm, a, z, 0.045, 1000)
    for k, t in enumerate(beats(a, z)):
        for s in range(2): place(music, pluck(note([62, 65, 62, 69][(k * 2 + s) % 4] - 12)), t + s * Bt / 2, 0.06)
        place(drums, kick(), t, 0.6 if k % 2 == 0 else 0.35)
        place(drums, hat(), t + Bt / 2, 0.08)
    # independence: brighter
    a, z = ch['independence']; h = a + (z - a) / 2
    chord_bed(F, a, h, 0.05, 2200); chord_bed(C, h, z, 0.055, 2600)
    for k, t in enumerate(beats(a, z)):
        place(drums, kick(), t, 0.8); place(drums, hat(open_=k % 2 == 1), t + Bt / 2, 0.12)
        if k % 2: place(drums, clap(), t, 0.3)
        place(music, pluck(note([72, 76, 79, 84][k % 4])), t, 0.05)
    place(music, riser(2 * Bt), ch['legacy'][0] - 2 * Bt, 0.12)
    # legacy: stabs, then the end chord rings out
    a, z = ch['legacy']
    for k, t in enumerate(beats(a, a + 12 * Bt)):
        place(music, stab([m + 12 for m in (Am, F, C, G)[(k // 2) % 4]]), t, 0.12); place(drums, kick(), t, 0.9)
        if k % 2: place(drums, clap(), t, 0.35)
    end = [c['t'] for c in data['cues'] if c['kind'] == 'end'][0]
    place(music, pad([45, 57, 60, 64, 69, 76], z - end + 0.2, 2400) * np.exp(-T(z - end + 0.2) / 2.0), end, 0.09)

    for c in data['cues']:
        k, t = c['kind'], c['t']
        if k == 'whoosh': place(sfx, sweep(0.6, 400, 7000, 1.2), t - 0.25, 0.12, pan=-0.2)
        elif k == 'hit': place(sfx, boom(1.2), t - 0.12, 0.28 if c['chapter'] not in ('americas', 'slavery') else 0.18)
        elif k == 'bounce': place(sfx, popsfx(), t, 0.3)
        elif k == 'bloom': place(sfx, sweep(1.2, 300, 5000, 2), t, 0.1); place(sfx, success(), t + 0.4, 0.06)
        elif k == 'type': place(sfx, keytap(), t, 0.12, pan=rng.uniform(-0.3, 0.3))
        elif k == 'impact': place(sfx, boom(2.0), t, 0.45)
        elif k == 'horn': place(sfx, pad([43, 50], 1.4, 700) * env(T(1.4), 0.3, 0.6), t, 0.08)
        elif k == 'fade': place(sfx, boom(0.3, 60, 35), t, 0.12)
        elif k == 'coin': place(sfx, bell(note(52), 1.2), t, 0.05)
        elif k == 'shuffle':
            for j in range(6): place(sfx, sweep(0.12, 1500, 6000, 1), t + j * 0.06, 0.05, pan=-0.5 + 0.2 * j)
        elif k == 'tick': place(sfx, click(3000), t, 0.14)
        elif k == 'end': place(sfx, boom(3.0), t, 0.5); place(sfx, chime(), t + 0.1, 0.05)

    ir = reverb_ir(2.2)
    mix = drums * 0.85 + music + sfx + convolve(music * 0.5 + sfx * 0.5 + drums * 0.06, ir) * 0.35
    tt = np.arange(n) / SR
    mix *= np.minimum(1, tt / 0.1)[:, None] * np.clip((dur - tt) / 1.0, 0, 1)[:, None]
    mix = np.tanh(mix * 1.5) / np.tanh(1.5)
    mix *= 0.9 / (np.abs(mix).max() + 1e-9)
    os.makedirs(os.path.join(root, 'audio'), exist_ok=True)
    write_wav(os.path.join(root, 'audio/mix.wav'), mix)
    print(f'wrote audio/mix.wav ({dur:.1f}s)')


if __name__ == '__main__':
    main()
