"""Synthesize the ad's soundtrack with numpy: a 120 BPM track + UI sound effects on the page's cues.

usage: python3 scripts/mix_audio.py     (needs out/cues.json: `node scripts/render.mjs cues`)
writes audio/mix.wav, which render.mjs muxes into the video

Song map (beats at 120 BPM, 1 beat = 0.5s), matching the scenes in index.html:
  0-4 hook: pad + riser, no drums      4 logo: impact, drop
  8-49 features: full groove           49-53 team: filtered break, then back
  55-56 snare roll                     56-59 recap: chord stab per half beat
  59 end card: impact, last chord rings out
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
    dur, Bt = data['duration'], data['beat']
    n = int(SR * (dur + 0.05))
    drums, music, sfx = (np.zeros((n, 2)) for _ in range(3))
    bt = lambda k: k * Bt

    # chords: A minor pop loop, 2 bars (8 beats) each. [root midi, voicing]
    prog = [(45, [57, 60, 64, 69]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
    chord_at = lambda beat: prog[int(beat // 8) % 4]

    # pad everywhere; darker in the hook
    for c in range(0, 64, 8):
        r, v = chord_at(c)
        cutoff = 900 if c < 4 else 1400 if 49 <= c < 53 else 2200
        place(music, pad(v, bt(8) + 0.2, cutoff), bt(c), 0.045 if c >= 4 else 0.07)
    place(music, riser(bt(2)), bt(2), 0.14)
    place(music, riser(bt(3)), bt(53), 0.12)

    for beat in range(4, 56):
        t0 = bt(beat)
        r, v = chord_at(beat)
        groove = beat >= 8 and not (49 <= beat < 53)
        if beat >= 8 or beat in (4, 6):
            if groove or beat in (4, 6, 53, 54, 55):
                place(drums, kick(), t0, 0.9)
        if groove and beat % 2 == 1:
            place(drums, clap(), t0, 0.35)
        if beat >= 8:
            for k in range(4 if groove else 2):
                place(drums, hat(open_=(k == 2 and groove)), t0 + k * Bt / (4 if groove else 2), 0.12 if k % 2 else 0.2, pan=0.25 if k % 2 else -0.15)
        # bass: root on the beat, octave pop on the offbeat
        if beat >= 8 and groove:
            place(music, bass(note(r - 12), Bt * 0.45), t0, 0.28)
            place(music, bass(note(r), Bt * 0.22), t0 + Bt / 2 + Bt / 4, 0.18)
        # plucks: arpeggio in 8ths
        if beat >= 8:
            for k in range(2):
                m = v[(beat * 2 + k) % 4] + 12
                place(music, pluck(note(m)), t0 + k * Bt / 2, 0.05 if groove else 0.07, pan=0.4 * np.sin(beat + k))
    # snare roll into the recap
    for k in range(16):
        place(drums, snare(), bt(55) + k * Bt / 16 * 2 - Bt, 0.12 + 0.3 * k / 16)
    # recap stabs: one per half beat
    for c in [c for c in data['cues'] if c['kind'] == 'stab']:
        r, v = prog[c['i'] % 4]
        place(music, stab([m + 12 for m in v]), c['t'], 0.16)
        place(drums, kick(), c['t'], 0.9)
        place(sfx, boom(0.6), c['t'], 0.2)
    # end chord rings
    place(music, pad([57, 60, 64, 69, 76], 3.5, 2500) * np.exp(-T(3.5) / 1.4), bt(59), 0.08)

    # ---------- cues ----------
    for c in data['cues']:
        k, t = c['kind'], c['t']
        if k == 'swell': place(sfx, sweep(1.8, 200, 1500, 2), t, 0.16)
        elif k == 'hit_soft': place(sfx, boom(1.2), t, 0.25)
        elif k == 'riser': pass  # musical riser already placed
        elif k == 'impact': place(sfx, boom(2.4), t, 0.6); place(sfx, sweep(1.2, 6000, 800, 0.4), t, 0.12)
        elif k == 'whoosh': place(sfx, sweep(0.45, 500, 6000, 1.2), t - 0.2, 0.14, pan=-0.2)
        elif k == 'whoosh_big': place(sfx, sweep(0.8, 300, 8000, 1.0), t - 0.5, 0.2)
        elif k == 'swipe': place(sfx, sweep(0.3, 1500, 7000, 1.5), t, 0.1, pan=0.3)
        elif k == 'pop': place(sfx, popsfx(), t, 0.22)
        elif k == 'key': place(sfx, keytap(), t, 0.1, pan=rng.uniform(-0.2, 0.2))
        elif k == 'click': place(sfx, click(), t, 0.3)
        elif k == 'drop': place(sfx, boom(0.4), t, 0.2); place(sfx, click(1400), t, 0.3)
        elif k == 'success': place(sfx, success(), t, 0.1)
        elif k == 'typeburst':
            for j in range(int(c['dur'] / 0.045)): place(sfx, keytap(), t + j * 0.045, 0.08, pan=rng.uniform(-0.2, 0.2))
        elif k == 'type_stream':
            for j in range(10): place(sfx, keytap(), t + j * 0.05, 0.05)
        elif k == 'shuffle':
            for j in range(5): place(sfx, sweep(0.12, 2000, 6000, 1), t + j * 0.05, 0.05, pan=-0.4 + 0.2 * j)
        elif k == 'toggle': place(sfx, toggle(), t, 0.35)
        elif k == 'chime': place(sfx, chime(), t, 0.05)

    ir = reverb_ir()
    # sidechain-ish pump on music from the kick grid
    tt = np.arange(n) / SR
    ph = (tt % Bt) / Bt
    pump = np.where((tt > bt(8)) & (tt < bt(49)) | (tt > bt(53)) & (tt < bt(56)), 0.65 + 0.35 * np.minimum(1, ph * 4), 1.0)
    mix = drums * 0.9 + sfx + (music + convolve(music * 0.5, ir) * 0.35) * pump[:, None] + convolve(sfx * 0.6, ir) * 0.3
    mix *= np.minimum(1, tt / 0.05)[:, None] * np.clip((dur - tt) / 1.2, 0, 1)[:, None]
    mix = np.tanh(mix * 1.5) / np.tanh(1.5)
    mix *= 0.9 / (np.abs(mix).max() + 1e-9)
    os.makedirs(os.path.join(root, 'audio'), exist_ok=True)
    write_wav(os.path.join(root, 'audio/mix.wav'), mix)
    print(f'wrote audio/mix.wav ({dur:.1f}s, {len(data["cues"])} cues)')


if __name__ == '__main__':
    main()
