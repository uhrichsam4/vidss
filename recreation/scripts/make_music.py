"""Synthesize a 128 BPM backing track with numpy so the demo has music to sync to.

usage: python3 scripts/make_music.py [--beats 42] [--out audio/song.wav]

Drop in a real song instead and run analyze_audio.py on it; index.html only needs the beat length.
"""
import sys
import wave

import numpy as np

SR = 48000
BPM = 128
rng = np.random.default_rng(3)


def arg(name, default):
    return type(default)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


def env(t, attack, decay):
    return np.clip(t / attack, 0, 1) * np.exp(-np.maximum(0, t - attack) / decay)


def kick():
    t = np.arange(int(SR * 0.45)) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.002, 0.16)


def hat():
    t = np.arange(int(SR * 0.08)) / SR
    n = np.diff(rng.standard_normal(len(t) + 1))
    return n * env(t, 0.001, 0.018) * 0.25


def impact():
    t = np.arange(int(SR * 1.6)) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * env(t, 0.003, 0.5)
    noise = rng.standard_normal(len(t)) * env(t, 0.001, 0.25) * 0.35
    return boom + noise


def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    x = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.3 * t) * 0.4) for f in freqs)
    return x * np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.3)


def riser(dur):
    t = np.arange(int(SR * dur)) / SR
    n = rng.standard_normal(len(t))
    # crude band-pass sweep: difference of two moving averages whose width shrinks over time
    out = np.zeros_like(n)
    acc_fast = acc_slow = 0.0
    for i in range(len(n)):
        p = t[i] / dur
        a_fast = 0.02 + 0.5 * p
        acc_fast += a_fast * (n[i] - acc_fast)
        acc_slow += 0.01 * (n[i] - acc_slow)
        out[i] = acc_fast - acc_slow
    return out * (t / dur) ** 2


def place(mix, x, at, gain=1.0):
    i = int(at * SR)
    j = min(len(mix), i + len(x))
    if i < len(mix):
        mix[i:j] += x[: j - i] * gain


def main():
    beats = arg('--beats', 42)
    out = arg('--out', 'audio/song.wav')
    lead_in = 0.25  # silence before beat 0, so the analyzer has to find the phase
    B = 60 / BPM
    dur = lead_in + beats * B + 2
    mix = np.zeros(int(SR * dur))
    k, h = kick(), hat()
    # sections (in beats), mirroring index.html: intro, titles, terminal, logo hit, sphere, feature cuts, end
    for b in range(beats):
        t = lead_in + b * B
        if 2 <= b < 16 or 17 <= b < 37:
            place(mix, k, t, 0.9)
            place(mix, h, t + B / 2, 1.0)
        if 22 <= b < 37:
            place(mix, h, t + B / 4, 0.5)
            place(mix, h, t + 3 * B / 4, 0.5)
    for b in (16.5, 22, 30, 37):
        place(mix, impact(), lead_in + b * B, 0.8)
    place(mix, riser(3 * B), lead_in + 13.5 * B, 0.5)
    place(mix, riser(2 * B), lead_in + 35 * B, 0.5)
    chords = [[110, 164.8, 220], [98, 146.8, 196], [87.3, 130.8, 174.6], [98, 146.8, 196]]
    for i, b in enumerate(range(0, beats, 8)):
        place(mix, pad(chords[i % 4], 8 * B), lead_in + b * B, 0.08)
    mix /= np.abs(mix).max() / 0.9
    pcm = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'wrote {out} ({dur:.2f}s, {BPM} BPM, beat 0 at {lead_in}s)')


if __name__ == '__main__':
    main()
