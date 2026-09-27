# Song + sound effects -> audio/mix.wav (film length, -14 LUFS).    python3 tools/mix.py   (needs out/cues.json)
#
# Song: menu_intro_music (Godot TPS demo, CC BY 3.0), 117.48 BPM, drop on a downbeat at 48.039 s. It is stretched to
# 120 BPM and cut on its beat grid so the film's beats line up with the song's:
#   film  0-36  song beats -52..-16 (verse into the lift)      film 36-40  -4..0  (the build)
#   film 40-44  0..4  (the drop: first pop)                    film 44-52  -16..-8 (the breakdown: the call)
#   film 52-55  -3..0 (build again)                            film 55-56  0..1  (the beat returns: letters spring out)
# SFX: each sample's loudest moment (5 ms envelope peak) is placed on its cue, never the file start.
import json, subprocess, os
import numpy as np, soundfile as sf

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
tl = json.load(open(P('out/cues.json')))
DUR, B = tl['duration'], tl['beat']

SRC_BPM, SRC_DROP = 117.48, 48.039
os.makedirs(P('tmp'), exist_ok=True)
stretched = P('tmp/song120.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', P('audio/src/music/song01_tps_menu_intro_music.ogg'),
                '-af', f'rubberband=tempo={120 / SRC_BPM:.6f}:transients=crisp', '-ar', str(SR), stretched], check=True)
song, sr = sf.read(stretched, always_2d=True); assert sr == SR

# the beat grid carries over exactly (a global onset-grid fit of the stretched file lands within 2 ms of this)
D = SRC_DROP * SRC_BPM / 120

SEG = [(0, 36, -52), (36, 40, -4), (40, 44, 0), (44, 52, -16), (52, 55, -3), (55, 56, 0)]
N = int(round(DUR * SR)); music = np.zeros((N, 2)); XF = int(0.012 * SR)
for fb0, fb1, k0 in SEG:
    a = int(round(fb0 * B * SR)); n = int(round((fb1 - fb0) * B * SR))
    s0 = int(round((D + k0 * 0.5) * SR))
    lead = XF if a > 0 else 0                                  # overlap the previous segment by one crossfade
    chunk = song[s0 - lead: s0 + n].copy()
    w = np.ones(len(chunk))
    if lead: w[:lead] = np.sin(np.linspace(0, np.pi / 2, lead)) ** 2
    if a > 0:
        music[a - lead: a] *= np.cos(np.linspace(0, np.pi / 2, lead))[:, None] ** 2
    end = min(N, a - lead + len(chunk)); music[a - lead: end] += (chunk * w[:, None])[: end - (a - lead)]
music[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]
music[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]

sfx = np.zeros((N, 2)); cache = {}
for c in tl['cues']:
    if c['name'] not in cache:
        x, r = sf.read(P('audio/src/sfx', c['name'] + '.wav'), always_2d=True); assert r == SR
        if x.shape[1] == 1: x = np.repeat(x, 2, 1)
        e = np.convolve(np.abs(x).mean(1), np.ones(220) / 220, 'same')
        cache[c['name']] = (x, int(np.argmax(e)))
    x, pk = cache[c['name']]
    start = int(round(c['t'] * SR)) - pk
    a, b = max(0, start), min(N, start + len(x))
    if b > a: sfx[a:b] += x[a - start: b - start] * 10 ** (c['db'] / 20)

mix = music * 10 ** (-4 / 20) + sfx
raw = P('tmp/mix_raw.wav'); sf.write(raw, np.clip(mix, -1, 1), SR, subtype='FLOAT')
# two-pass loudnorm to -14 LUFS, -1 dBTP
st = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(st[st.rindex('{'): st.rindex('}') + 1])
os.makedirs(P('audio'), exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                '-ar', str(SR), '-c:a', 'pcm_s16le', '-t', f'{DUR}', P('audio/mix.wav')], check=True)
print('cues', len(tl['cues']), 'input LUFS', m['input_i'], '-> audio/mix.wav')
