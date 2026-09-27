# Song + voice + sound effects -> audio/mix.wav (60 s, -14 LUFS).   node tools/render.mjs cues && python3 tools/mix.py
#
# Song: "menu_intro_music" (Godot TPS demo, CC BY 3.0), 117.48 BPM, drop on a downbeat at 48.039 s; stretched to 120 BPM
# and cut only at bar lines (song beat k counts half-seconds from the drop):
#   film   1-41  k -92..-52  intro into the lower section   film 41-45  k -4..0   the build
#   film  45-65  k   0..20   the drop (Start cam floods)    film 65-73  k -16..-8 the quiet breakdown (the zoom story)
#   film  73-77  k  -4..0    the build again               film 77-113 k 0..36   the beat return (the hand lifts into 3D)
#   film 113-121 k  36..44   the close, fading after the letters land on 119
# Voice: Kokoro am_fenrir lines on their beats; the music ducks 5 dB under them. SFX: each sample's peak on its cue.
import json, subprocess, os
import numpy as np, soundfile as sf

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
tl = json.load(open(P('out/cues.json')))
DUR, B = tl['duration'], tl['beat']
N = int(round(DUR * SR))
SRC_BPM, SRC_DROP = 117.48, 48.039
os.makedirs(P('tmp'), exist_ok=True)
stretched = P('tmp/song120.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', P('audio/src/song01_tps_menu_intro_music.ogg'),
                '-af', f'rubberband=tempo={120 / SRC_BPM:.6f}:transients=crisp', '-ar', str(SR), '-ac', '2', stretched], check=True)
song, sr = sf.read(stretched, always_2d=True); assert sr == SR
D = SRC_DROP * SRC_BPM / 120                                   # the beat grid carries over exactly
SEG = [(1, 41, -92), (41, 45, -4), (45, 65, 0), (65, 73, -16), (73, 77, -4), (77, 113, 0), (113, 121, 36)]
music = np.zeros((N, 2)); XF = int(0.012 * SR)
for fb0, fb1, k0 in SEG:
    a = int(round((fb0 - 1) * B * SR)); n = min(N - a, int(round((fb1 - fb0) * B * SR)))
    s0 = int(round((D + k0 * 0.5) * SR)); lead = XF if a > 0 else 0
    chunk = song[max(0, s0 - lead): s0 + n].copy()
    if s0 - lead < 0: chunk = np.vstack([np.zeros((lead - s0, 2)), chunk])
    w = np.ones(len(chunk));
    if lead: w[:lead] = np.sin(np.linspace(0, np.pi / 2, lead)) ** 2; music[a - lead: a] *= np.cos(np.linspace(0, np.pi / 2, lead))[:, None] ** 2
    end = min(N, a - lead + len(chunk)); music[a - lead: end] += (chunk * w[:, None])[: end - (a - lead)]
fade = int(1.4 * SR); music[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
music[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]

def load(path):
    x, r = sf.read(path, always_2d=True)
    if r != SR:
        tmp = P('tmp/_rs.wav'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', str(SR), tmp], check=True); x, r = sf.read(tmp, always_2d=True)
    return np.repeat(x, 2, 1) if x.shape[1] == 1 else x
# voice: each line's first sound on its beat (the file starts `lead` seconds before it)
vox = np.zeros((N, 2))
for v in tl['voice']:
    x = load(P(v['file'])); start = int(round((v['t'] - v['lead']) * SR)); a, b = max(0, start), min(N, start + len(x))
    if b > a: vox[a:b] += x[a - start: b - start]
env = np.abs(vox).mean(1); k = int(0.25 * SR)
env = np.convolve(env > 0.01, np.ones(k) / k, 'same')         # voice activity, smoothed (~60 ms up, ~250 ms down feel)
duck = 10 ** (-5 * np.clip(env * 3, 0, 1) / 20)
sfx = np.zeros((N, 2)); cache = {}
for c in tl['cues']:
    if c['name'] not in cache:
        x = load(P('audio/src/sfx', c['name'] + '.wav')); e = np.convolve(np.abs(x).mean(1), np.ones(220) / 220, 'same'); cache[c['name']] = (x, int(np.argmax(e)))
    x, pk = cache[c['name']]; start = int(round(c['t'] * SR)) - pk
    a, b = max(0, start), min(N, start + len(x))
    if b > a: sfx[a:b] += x[a - start: b - start] * 10 ** (c['db'] / 20)
mix = music * 10 ** (-6 / 20) * duck[:, None] + vox * 10 ** (-1 / 20) + sfx
raw = P('tmp/mix_raw.wav'); sf.write(raw, np.clip(mix, -1, 1), SR, subtype='FLOAT')
st = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(st[st.rindex('{'): st.rindex('}') + 1])
os.makedirs(P('audio'), exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                '-ar', str(SR), '-c:a', 'pcm_s16le', '-t', f'{DUR}', P('audio/mix.wav')], check=True)
print('cues', len(tl['cues']), 'voice lines', len(tl['voice']), 'input LUFS', m['input_i'], '-> audio/mix.wav')
