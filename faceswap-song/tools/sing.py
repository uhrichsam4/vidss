# Speech -> singing: Kokoro speaks a lyric line, WORLD re-times each syllable's vowel onto its note and sets the pitch
# (hard autotune with a short glide and late vibrato).   imported by tools/song.py
import numpy as np, pyworld as pw, soundfile as sf, os
from kokoro_onnx import Kokoro
SR = 24000
_k = None
def tts(text, voice='am_fenrir', speed=1.0):
    global _k
    if _k is None:
        R = '/home/user/vidss/faceswap-film/tools/tts/'; _k = Kokoro(R + 'kokoro-v1.0.onnx', R + 'voices-v1.0.bin')
    s, sr = _k.create(text, voice=voice, speed=speed, lang='en-us'); assert sr == SR
    return s.astype(np.float64)
def nuclei(x, f0, t, n):
    # syllable nuclei: peaks of voiced loudness, the n strongest, kept in order and at least 90 ms apart
    hop = int(SR * 0.005); e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop + hop] ** 2) + 1e-12) for i in range(len(t))])
    e = e * (f0 > 0); k = np.exp(-0.5 * (np.arange(-8, 9) / 3.5) ** 2); e = np.convolve(e, k / k.sum(), 'same')
    pk = [i for i in range(1, len(e) - 1) if e[i] >= e[i - 1] and e[i] > e[i + 1] and e[i] > 0.08 * e.max()]
    pk = sorted(pk, key=lambda i: -e[i]); keep = []
    for i in pk:
        if all(abs(i - j) > 18 for j in keep): keep.append(i)
    keep = sorted(keep[:n])
    if len(keep) < n:                                      # too few peaks: spread the rest evenly over the voiced span
        v = np.where(f0 > 0)[0]; keep = sorted(set(keep) | set(np.linspace(v[0], v[-1], n).astype(int).tolist()))[:n]
        keep = sorted(keep)
    return np.array(keep) * 0.005
def sing(text, notes, beat, voice='am_fenrir', speed=1.0, vib=0.35, lead=0.03):
    """notes: [(midi, beats)] one per syllable; returns audio (SR) that starts exactly on the line's first note."""
    x = tts(text, voice, speed)
    f0, t = pw.harvest(x, SR, f0_floor=60, f0_ceil=400, frame_period=5.0)
    sp = pw.cheaptrick(x, f0, t, SR); ap = pw.d4c(x, f0, t, SR)
    n = len(notes); src = nuclei(x, f0, t, n)
    starts = np.cumsum([0] + [d for _, d in notes])[:-1] * beat; total = sum(d for _, d in notes) * beat
    # target time of each nucleus: a little after its note starts (the consonant leads the beat)
    tgt = starts + np.minimum(0.06, np.array([d for _, d in notes]) * beat * 0.25)
    v = np.where(f0 > 0)[0]; s0, s1 = max(0, t[v[0]] - 0.08), min(t[-1], t[v[-1]] + 0.12)
    A = np.concatenate([[s0], src, [s1]]); Bt = np.concatenate([[max(0, tgt[0] - (src[0] - s0))], tgt, [total + 0.05]])
    Bt = np.maximum.accumulate(Bt + np.arange(len(Bt)) * 1e-4)
    out_t = np.arange(0, Bt[-1] + 0.1, 0.005); s_of = np.interp(out_t, Bt, A)
    idx = np.clip(np.round(s_of / 0.005).astype(int), 0, len(t) - 1)
    spo, apo = sp[idx], ap[idx]; voiced = f0[idx] > 0
    # pitch: the note each output frame belongs to, glide 40 ms into it, vibrato after 180 ms on long notes
    note_i = np.clip(np.searchsorted(starts, out_t, 'right') - 1, 0, n - 1)
    midi = np.array([notes[i][0] for i in note_i], float)
    g = np.convolve(midi, np.ones(8) / 8, 'same'); g[:4] = midi[:4]
    into = out_t - starts[note_i]; vibr = vib * np.sin(2 * np.pi * 5.6 * out_t) * np.clip((into - 0.18) / 0.2, 0, 1)
    f0o = 440 * 2 ** ((g + vibr - 69) / 12) * voiced
    y = pw.synthesize(f0o, np.ascontiguousarray(spo), np.ascontiguousarray(apo), SR, 5.0)
    return y / (np.abs(y).max() + 1e-9) * 0.9
if __name__ == '__main__':
    B = 60 / 128
    # "One message in the dark" : A3 A3 C4 B3 A3 E3 over two bars
    y = sing('One message in the dark,', [(57, 1), (57, 0.5), (60, 0.5), (59, 1), (57, 1), (52, 3)], B)
    sf.write('/tmp/sing_test.wav', y, SR); print(len(y) / SR, 's')
