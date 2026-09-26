"""Synthesize the morph ad's soundtrack with numpy: a 125 BPM disco-house groove + UI sounds on the page's cues.

usage: python3 scripts/mix_audio.py     (needs out/cues.json: `node scripts/render.mjs cues`)
writes audio/mix.wav, which render.mjs muxes into the video

The groove loops every 12 bars (48 beats) so the video loops seamlessly; the one-shot UI sounds
sit exactly on the cue times exported by timeline() in index.html (clicks, keys, pops, swishes...).
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


def boom(dur=2.2):
    t = T(dur)
    f = 36 + 90 * np.exp(-t / 0.08)
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
    dur, Bt, beats = data['duration'], data['beat'], data['beats']
    n = int(round(SR * dur))
    drums, music, sfx = (np.zeros((n, 2)) for _ in range(3))
    bt = lambda k: k * Bt

    def put(mix, x, at, gain=1.0, pan=0.0):
        # wrap past the end so the loop point is seamless
        tmp = np.zeros((n + len(x) + 10, 2))
        place(tmp, x, at, gain, pan)
        mix += tmp[:n]
        mix[: len(tmp) - n] += tmp[n:]

    # Fmaj7 - Em7 - Dm7 - Cmaj7 (disco-ish), one chord per bar
    prog = [(41, [57, 60, 64, 67]), (40, [55, 59, 62, 67]), (38, [53, 57, 60, 65]), (36, [55, 59, 60, 64])]
    for bar in range(beats // 4):
        r, v = prog[bar % 4]
        t0 = bt(bar * 4)
        # offbeat chord stabs (the "disco" skank) + soft pad underneath
        for k in (0.5, 1.5, 2.5, 3.5):
            put(music, stab(v), t0 + bt(k), 0.05)
        put(music, pad(v, bt(4), 1500), t0, 0.018)
        # octave-jumping bass, 8ths
        for k in range(8):
            m = r - 12 + (12 if k % 2 else 0)
            put(music, bass(note(m), Bt * 0.4), t0 + k * Bt / 2, 0.22 if k % 2 == 0 else 0.15)
        for k in range(4):
            put(drums, kick(), t0 + bt(k), 0.8)
            put(drums, hat(open_=True), t0 + bt(k + 0.5), 0.13, pan=0.2)
            put(drums, hat(), t0 + bt(k + 0.25), 0.06, pan=-0.2)
            put(drums, hat(), t0 + bt(k + 0.75), 0.06, pan=-0.2)
            if k % 2 == 1:
                put(drums, clap(), t0 + bt(k), 0.28)

    for c in data['cues']:
        k, t = c['kind'], c['t']
        if k == 'click': put(sfx, click(2200), t, 0.35)
        elif k == 'swish': put(sfx, sweep(0.28, 900, 5000, 1.4), t - 0.06, 0.05, pan=0.25)
        elif k == 'key': put(sfx, keytap(), t, 0.14, pan=rng.uniform(-0.15, 0.15))
        elif k == 'pop': put(sfx, popsfx(), t, 0.25)
        elif k == 'press': put(sfx, click(1500), t, 0.2)
        elif k == 'release': put(sfx, click(2600), t, 0.16)
        elif k == 'swipe': put(sfx, sweep(0.25, 1500, 7000, 1.5), t, 0.07)
        elif k == 'shuffle':
            for j in range(4): put(sfx, sweep(0.1, 2000, 6000, 1), t + j * 0.045, 0.04, pan=-0.3 + 0.2 * j)
        elif k == 'drop': put(sfx, boom(0.35), t, 0.18); put(sfx, click(1300), t, 0.25)
        elif k == 'tick': put(sfx, click(3200), t, 0.12)
        elif k == 'success': put(sfx, success(), t, 0.1)
        elif k == 'toggle': put(sfx, toggle(), t, 0.4)
        elif k == 'swell': put(sfx, sweep(0.8, 300, 2500, 2), t, 0.05)
        elif k == 'impact': put(sfx, boom(0.9), t, 0.3); put(sfx, success(), t + 0.05, 0.08)

    ir = reverb_ir()
    tt = np.arange(n) / SR
    pump = 0.6 + 0.4 * np.minimum(1, ((tt % Bt) / Bt) * 4)
    mix = drums * 0.85 + (music + convolve(music * 0.4, ir) * 0.3) * pump[:, None] + sfx + convolve(sfx * 0.5, ir) * 0.25
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    mix *= 0.9 / (np.abs(mix).max() + 1e-9)
    os.makedirs(os.path.join(root, 'audio'), exist_ok=True)
    write_wav(os.path.join(root, 'audio/mix.wav'), mix)
    print(f'wrote audio/mix.wav ({dur:.2f}s loop, {len(data["cues"])} cues)')


if __name__ == '__main__':
    main()
