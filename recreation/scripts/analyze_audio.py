"""Beat grid from audio with numpy only: spectral-flux onsets -> tempo (autocorrelation) -> phase.

usage: python3 scripts/analyze_audio.py audio/song.wav --out audio/beats.json [--bpm 128]

Writes {bpm, beat, start, beats[]} where start is the time of beat 0 in the file.
render.mjs trims the audio at `start` and passes `beat` into the page via configure().
"""
import json
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 256
N_FFT = 1024
# frame i spans samples [i*HOP, i*HOP + N_FFT); stamping it at the window start reads ~half a window early
WINDOW_DELAY = N_FFT / 2 / SR


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def onset_envelope(y, max_hz=None):
    n_fft = N_FFT
    win = np.hanning(n_fft).astype(np.float32)
    frames = 1 + (len(y) - n_fft) // HOP
    idx = np.arange(n_fft)[None, :] + HOP * np.arange(frames)[:, None]
    spec = np.log1p(100 * np.abs(np.fft.rfft(y[idx] * win, axis=1)))
    if max_hz:
        spec = spec[:, : int(max_hz / (SR / n_fft)) + 1]
    flux = np.concatenate([[0], np.maximum(0, np.diff(spec, axis=0)).sum(axis=1)])
    k = int(SR / HOP * 0.5)
    env = np.maximum(0, flux - np.convolve(flux, np.ones(k) / k, mode='same'))
    return env / (env.max() + 1e-9)


def estimate_bpm(env, lo, hi):
    fps = SR / HOP
    ac = np.correlate(env, env, mode='full')[len(env) - 1:]
    ac /= ac[0] + 1e-9
    best, best_score = lo, -1.0
    for bpm in np.arange(lo, hi, 0.05):
        score = 0.0
        for m in (1, 2, 4):
            lag = 60 / bpm * fps * m
            i = int(lag)
            if i + 1 >= len(ac):
                break
            f = lag - i
            score += (ac[i] * (1 - f) + ac[i + 1] * f) / m
        if score > best_score:
            best, best_score = bpm, score
    return float(best)


def beat_phase(env, bpm):
    fps = SR / HOP
    period = 60 / bpm
    end = len(env) / fps
    best, best_score = 0.0, -1.0
    for phase in np.arange(0, period, 0.001):
        fr = np.round(np.arange(phase, end, period) * fps).astype(int)
        fr = fr[fr < len(env)]
        score = env[fr].mean()
        if score > best_score:
            best, best_score = phase, score
    return float(best)


def refine(env, bpm, phase):
    """Joint fine search of tempo and phase: a 0.3 BPM error drifts ~50ms over 40 beats."""
    fps = SR / HOP
    end = len(env) / fps - 1
    best = (-1.0, bpm, phase)
    for b in np.arange(bpm - 1, bpm + 1, 0.01):
        p = 60 / b
        for ph in np.arange(0, p, 0.002):
            fr = np.arange(ph, end, p) * fps
            i = fr.astype(int)
            f = fr - i
            score = (env[i] * (1 - f) + env[i + 1] * f).mean()
            if score > best[0]:
                best = (score, float(b), float(ph))
    return best[1], best[2]


def main():
    path = sys.argv[1]
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else 'audio/beats.json'
    hint = float(sys.argv[sys.argv.index('--bpm') + 1]) if '--bpm' in sys.argv else None
    y = load(path)
    env = onset_envelope(y)
    bpm = estimate_bpm(env, hint - 3, hint + 3) if hint else estimate_bpm(env, 90, 160)
    # tempo from all onsets, phase from the kick band only: hats on the offbeat would otherwise win
    phase = beat_phase(onset_envelope(y, max_hz=200), bpm)
    bpm, phase = refine(onset_envelope(y, max_hz=200), bpm, phase)
    phase += WINDOW_DELAY
    period = 60 / bpm
    beats = np.arange(phase, len(y) / SR, period)
    data = {'source': path, 'bpm': round(bpm, 3), 'beat': period, 'start': round(phase, 4),
            'beats': [round(float(b - phase), 4) for b in beats]}
    json.dump(data, open(out, 'w'), indent=2)
    print(f'bpm={bpm:.2f} beat={period:.4f}s first beat at {phase:.3f}s -> {out}')


if __name__ == '__main__':
    main()
