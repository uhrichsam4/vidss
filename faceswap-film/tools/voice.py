# Voice lines from data/plan.json -> audio/voice/NN.wav (Kokoro-82M, voice am_fenrir, 24 kHz) + audio/voice/voice.json
# with each line's start (its first word on its beat), measured speech onset and length.   python3 tools/voice.py
import json, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plan = json.load(open(os.path.join(R, 'data/plan.json')))
k = Kokoro(os.path.join(R, 'tools/tts/kokoro-v1.0.onnx'), os.path.join(R, 'tools/tts/voices-v1.0.bin'))
out = os.path.join(R, 'audio/voice'); os.makedirs(out, exist_ok=True)
SAY = {'swapstudio.': 'swap studio.', 'Now: thirty.': 'Now... thirty.'}   # spelling for the ear only
rows = []
for n, (beat, line, key) in enumerate(plan['voice']):
    s, sr = k.create(SAY.get(line, line), voice='am_fenrir', speed=1.12, lang='en-us')
    e = np.convolve(np.abs(s), np.ones(240) / 240, 'same'); on = int(np.argmax(e > 0.02 * e.max()))
    off = len(e) - int(np.argmax(e[::-1] > 0.02 * e.max()))
    s = s[max(0, on - 240): off + 2400]; lead = min(on, 240) / sr
    sf.write(f'{out}/{n:02d}.wav', s, sr)
    t = (beat - 1) * 0.5
    rows.append({'n': n, 'beat': beat, 'line': line, 'key': key, 't': t, 'lead': round(lead, 3), 'len': round(len(s) / sr, 3), 'end': round(t + len(s) / sr - lead, 3)})
json.dump(rows, open(f'{out}/voice.json', 'w'), indent=1)
for a, b in zip(rows, rows[1:]):
    flag = '  OVERLAP' if a['end'] > b['t'] - 0.05 else ''
    print(f"b{a['beat']:>5} {a['t']:5.2f}-{a['end']:5.2f}s  {a['line']}{flag}")
print(f"b{rows[-1]['beat']:>5} {rows[-1]['t']:5.2f}-{rows[-1]['end']:5.2f}s  {rows[-1]['line']}")
