"""Synthesize the soundtrack with numpy: ambient pad + soft pulse, and sound effects placed on the page's cues.

usage: python3 scripts/mix_audio.py      (needs out/cues.json: `node scripts/render.mjs cues`)
writes audio/mix.wav, which render.mjs muxes into the video

Cue kinds (from timeline() in index.html):
  intro, shimmer, whoosh, impact, today, swell, end   one-off moments
  tick                                                 every decade on the year counter
  caption                                              a new caption appears
  land                                                 one migrant dot arrives (pan = screen x)
"""
import json
import os
import wave

import numpy as np

SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(1922)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def env(t, attack, decay):
    return np.clip(t / attack, 0, 1) * np.exp(-np.maximum(0, t - attack) / decay)


def lowpass(x, fc):
    # one-pole, vectorised via exponential filter on cumulative sums is messy; a short FIR is plenty here
    n = max(3, int(SR / fc))
    k = np.hanning(n)
    return np.convolve(x, k / k.sum(), mode='same')


def note(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def place(mix, x, at, gain=1.0, pan=0.0):
    """Add mono or stereo x at time `at` (seconds) with equal-power pan."""
    i = int(round(at * SR))
    if i >= len(mix):
        return
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(mix), i + len(x))
    x = x[: j - i]
    if x.ndim == 1:
        a = (pan + 1) * np.pi / 4
        mix[i:j, 0] += x * gain * np.cos(a)
        mix[i:j, 1] += x * gain * np.sin(a)
    else:
        mix[i:j] += x * gain


# ---------- instruments ----------
def pad_voice(freq, dur):
    t = t_axis(dur)
    out = np.zeros_like(t)
    for det in (-0.004, 0.0, 0.0045):
        f = freq * (1 + det)
        for h in range(1, 7):
            out += np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28)) / h ** 1.6
    return out


def chord(midis, dur, fade=1.2):
    t = t_axis(dur)
    x = sum(pad_voice(note(m), dur) for m in midis)
    x = lowpass(x, 2200)
    shape = np.minimum(1, t / fade) * np.minimum(1, (dur - t) / fade)
    wobble = 1 + 0.15 * np.sin(2 * np.pi * 0.25 * t)
    return x * shape * wobble


def pluck(freq, dur=0.5):
    t = t_axis(dur)
    x = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * env(t, 0.004, 0.16)
    return x


def bell(freq, dur=2.5):
    t = t_axis(dur)
    parts = [(1, 1, 1.2), (2.76, 0.4, 0.5), (5.4, 0.2, 0.25), (8.9, 0.08, 0.12)]
    return sum(a * np.sin(2 * np.pi * freq * r * t) * env(t, 0.002, d) for r, a, d in parts)


def blip(freq):
    t = t_axis(0.16)
    return (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2.01 * t)) * env(t, 0.002, 0.045)


def noise_sweep(dur, f0, f1, shape_pow=1.0):
    """Band-limited noise whose brightness moves from f0 to f1 (Hz), rising then falling in level."""
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    lo = hi = 0.0
    for i in range(len(n)):
        p = i / len(n)
        fc = f0 * (f1 / f0) ** p
        a = 1 - np.exp(-2 * np.pi * fc / SR)
        hi += a * (n[i] - hi)
        lo += 0.02 * (hi - lo)
        out[i] = hi - lo
    level = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** shape_pow
    return out * level


def boom(dur=2.5, f_hi=90, f_lo=38):
    t = t_axis(dur)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.09)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.004, 0.7)
    air = lowpass(rng.standard_normal(len(t)), 600) * env(t, 0.002, 0.3) * 0.6
    return body + air


def tick():
    t = t_axis(0.06)
    return np.sin(2 * np.pi * 2400 * t) * env(t, 0.0005, 0.006) + 0.6 * np.sin(2 * np.pi * 820 * t) * env(t, 0.001, 0.014)


def pop():
    t = t_axis(0.12)
    f = 700 + 900 * (1 - np.exp(-t / 0.015))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.003, 0.035)


def reverb_ir(dur=2.6):
    t = t_axis(dur)
    ir = np.stack([lowpass(rng.standard_normal(len(t)), 5000) for _ in range(2)], 1)
    ir *= np.exp(-t / 0.55)[:, None]
    ir[: int(0.012 * SR)] = 0  # pre-delay
    return ir / np.sqrt((ir ** 2).sum(0))


def convolve(x, ir):
    n = len(x) + len(ir)
    size = 1 << (n - 1).bit_length()
    out = np.zeros((len(x), 2))
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c], size) * np.fft.rfft(ir[:, c], size), size)
        out[:, c] = y[: len(x)]
    return out


def write_wav(path, data):
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ---------- score ----------
def main():
    data = json.load(open(os.path.join(root, 'out/cues.json')))
    dur = data['duration']
    cues = data['cues']
    at = {c['kind']: c['t'] for c in cues if c['kind'] in ('intro', 'shimmer', 'whoosh', 'impact', 'today', 'swell', 'end')}
    n = int(SR * (dur + 0.05))
    music = np.zeros((n, 2))
    sfx = np.zeros((n, 2))

    # pad: A minor-ish, warm and slow. [start, end, midi notes]
    progression = [
        (0.0, at['impact'] + 0.6, [45, 57, 60, 64, 71]),          # Am(add9)
        (at['impact'] - 0.4, 9.4, [41, 53, 57, 60, 64]),         # Fmaj7
        (7.9, at['today'] + 0.5, [48, 55, 60, 64, 67, 74]),      # C(add9)
        (at['today'], at['end'] + 0.5, [43, 55, 59, 62, 67, 69]),  # G6
        (at['end'], dur + 0.05, [45, 57, 60, 64, 67, 71]),        # Am9 resolve
    ]
    for a, b, notes in progression:
        place(music, chord(notes, b - a), a, 0.05)

    # soft pulse through the timeline: plucked chord tones in eighths at 100 BPM, plus a low heartbeat
    eighth = 60 / 100 / 2
    arps = {0: [69, 72, 76, 79], 1: [65, 69, 72, 76], 2: [67, 72, 76, 79], 3: [67, 71, 74, 79]}
    tt, k = at['impact'], 0
    while tt < at['end'] - 0.2:
        sect = 1 if tt < 8.6 else 2 if tt < at['today'] else 3
        if at['today'] - 0.1 < tt < at['swell']:  # breathe during the "latest data" hold
            tt += eighth
            k += 1
            continue
        f = note(arps[sect][k % 4] + (12 if k % 8 == 7 else 0))
        ramp = min(1, (tt - at['impact']) / 1.5)
        place(music, pluck(f), tt, 0.035 * ramp, pan=0.35 * np.sin(k * 0.7))
        if k % 2 == 0:
            place(music, boom(0.5, 70, 42), tt, 0.1 * ramp)
        tt += eighth
        k += 1

    # one-off moments
    place(sfx, noise_sweep(2.2, 200, 1800, 2), at['intro'], 0.05)
    place(sfx, boom(3.0, 55, 30), at['intro'], 0.12)
    for i, m in enumerate([81, 84, 88, 91, 93]):
        place(sfx, bell(note(m), 2.0), at['shimmer'] + i * 0.07, 0.035, pan=-0.4 + 0.2 * i)
    place(sfx, noise_sweep(1.5, 300, 5000, 1.5), at['whoosh'], 0.13, pan=-0.2)
    place(sfx, noise_sweep(1.3, 5000, 400, 1.0), at['whoosh'] + 0.35, 0.07, pan=0.3)
    place(sfx, boom(3.0), at['impact'], 0.38)
    place(sfx, noise_sweep(0.6, 400, 6000, 3), at['today'] - 0.55, 0.08)
    place(sfx, boom(2.5, 80, 36), at['today'], 0.35)
    place(sfx, bell(note(76)), at['today'], 0.06, pan=-0.2)
    place(sfx, bell(note(83)), at['today'] + 0.09, 0.05, pan=0.2)
    place(sfx, noise_sweep(0.9, 250, 3000, 2), at['swell'] - 0.3, 0.07)
    place(sfx, boom(3.5, 70, 32), at['end'], 0.4)
    for i, m in enumerate([69, 76, 81, 84]):
        place(sfx, bell(note(m), 3.0), at['end'] + 0.12 * i, 0.045, pan=-0.3 + 0.2 * i)

    for c in cues:
        if c['kind'] == 'tick':
            place(sfx, tick(), c['t'], 0.08)
        elif c['kind'] == 'caption':
            place(sfx, pop(), c['t'], 0.06)

    # arrivals: a soft pentatonic blip per dot, gain scaled by local density so dense bursts shimmer, not roar
    lands = [c for c in cues if c['kind'] == 'land']
    times = np.array([c['t'] for c in lands])
    scale = [81, 84, 86, 88, 91, 93, 96]
    blips = [blip(note(m)) for m in scale]
    for c in lands:
        density = np.count_nonzero(np.abs(times - c['t']) < 0.08)
        g = 0.07 / np.sqrt(max(1, density)) * (0.8 if c.get('proj') else 1)
        place(sfx, blips[rng.integers(len(blips))], c['t'], g, pan=c['pan'] * 0.8)

    # space, glue, master
    ir = reverb_ir()
    mix = music + sfx + convolve(music * 0.6 + sfx * 0.9, ir) * 0.55
    t = np.arange(n) / SR
    mix *= np.minimum(1, t / 0.4)[:, None] * np.clip((dur - t) / 1.6, 0, 1)[:, None]
    mix = np.tanh(mix * 1.6) / np.tanh(1.6)
    mix *= 0.89 / (np.abs(mix).max() + 1e-9)
    out = os.path.join(root, 'audio/mix.wav')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    write_wav(out, mix)
    print(f'wrote audio/mix.wav ({dur:.1f}s, {len(lands)} arrival blips)')


if __name__ == '__main__':
    main()
