# Beat map, clip slices, voice lines and the facts table, all computed from data/*.json.
#   python3 tools/plan.py  -> data/plan.json (read by index.html and tools/voice.py) + review/beatmap.md
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = json.load(open(os.path.join(R, 'data/facts.json')))
T = json.load(open(os.path.join(R, 'data/touches.json')))
BPM, B = 120, 0.5
BEATS = 120
t_of = lambda beat: (beat - 1) * B            # beat n starts at (n-1)/2 s
Q = F['maker_quotes']['lines']
touch = {k: v for k, v in [('pinch', T['touches'][0]), ('zoom', T['touches'][2]), ('tap1', T['touches'][4]), ('tap2', T['touches'][5])]}
PINCH, LETGO = touch['pinch']['start_s'], touch['pinch']['end_s']          # 5.967, 10.167
ZMET, ZMID, ZLET = T['zoom']['fingertips_met_f'] / 30, T['zoom']['middle_joined_f'] / 30, T['zoom']['let_go_f'] / 30
TAP1, TAP2 = touch['tap1']['start_s'], touch['tap2']['start_s']
POP = 251 / 30                                 # second outward swing reaches 2 tile sizes (56 px tiles, tools/touches.py)
# clip slices of the hand recording: clip time = in + (t - t0)
SLICES = [
    {'name': 'live', 'from_beat': 49, 'to_beat': 67, 'anchor': [PINCH, t_of(57)], 'why': 'pinch (5.97 s) on beat 57, let-go early in the Breakdown'},
    {'name': 'zoom', 'from_beat': 71, 'to_beat': 89, 'anchor': [TAP1, t_of(84)], 'why': 'first quick pinch on beat 84 (the second lands on 85)'},
    {'name': 'shelf', 'from_beat': 89, 'to_beat': 101, 'anchor': [POP, t_of(98)], 'why': 'shelf pop on beat 98'},
]
for s in SLICES:
    c, t0 = s['anchor']; s['in_s'] = round(c + (t_of(s['from_beat']) - t0), 3); s['out_s'] = round(c + (t_of(s['to_beat']) - t0), 3)
clip = lambda name, t: next(round(s['anchor'][0] + t - s['anchor'][1], 3) for s in SLICES if s['name'] == name)
film = lambda name, c: next(round(t0 + (c - c0) / B + 1, 2) for s in SLICES if s['name'] == name for c0, t0 in [(s['anchor'][0], s['anchor'][1] / B)])
peaks = [film('zoom', p) for p in T['zoom']['pump_top_s']]

SECTIONS = [(1, 'Open', 'flat'), (9, 'Build', 'flat'), (29, 'Start', 'flat, deep, flat'), (45, 'Live', 'flat real, then deep'),
            (65, 'Breakdown', 'deep, pressed flat'), (77, 'Return', 'deep'), (89, 'Shelf', 'deep'), (101, 'Call', 'deep, then flat'), (113, 'Close', 'flat')]
# voice (Kokoro, am_fenrir): [start beat, line, facts key]. Short lines on the beat, the reference's lyric style.
VOICE = [
    [1.5, 'It started with one message.', 'maker_quotes.lines[0]'],
    [8.75, 'Built in Claude Code, with builders, reviewers, and a harsh judge.', 'making_of.built_in'],
    [15.5, 'The first version: six to eight frames a second.', 'speed.first_version'],
    [19.5, 'Now: thirty.', 'speed.now'],
    [24.5, 'Out of a thousand: three seventy-three. Then five seventy-eight.', 'making_of.judge_out_of_1000_first_round / _second_round'],
    [31.5, 'Pick a face.', 'app.start_screen.flow'],
    [33.5, 'Drag in a model.', 'app.start_screen.flow'],
    [42, 'Start cam.', 'app.start_screen.flow'],
    [46.5, 'Live face swap, from one photo, right on the Mac.', 'app.what_it_does[0]'],
    [51.75, 'Thirty frames a second.', 'speed.now'],
    [53.75, 'A 3D model follows your open hand.', 'app.what_it_does[1]'],
    [58, 'Pinch: it stays exactly where it is. It only turns.', 'app.what_it_does[2]'],
    [65.5, 'But the zoom was recognised zero percent of the time.', 'making_of.what_the_recording_found'],
    [71.25, 'The 3D guess said the fingertips were apart.', 'making_of.what_the_recording_found'],
    [77, 'Measured in the picture: one hundred percent.', 'making_of.what_the_recording_found (prototype of the fix)'],
    [81.25, 'Three fingers: it grows, or shrinks.', 'app.what_it_does[4]'],
    [84.75, 'Two quick pinches: it faces you.', 'app.what_it_does[3]'],
    [89.5, 'A shelf of up to ten models.', 'app.shelf_models_max, app.what_it_does[5]'],
    [93.5, 'Pinch, pull. It resists,', 'app.what_it_does[5]'],
    [97.75, 'then pops into your hand.', 'app.what_it_does[5]'],
    [101, 'A virtual camera for calls and OBS.', 'app.what_it_does[7]'],
    [105.5, 'Hands stay in front of the face.', 'app.what_it_does[6]'],
    [108.5, 'On a MacBook Pro, M4 Pro.', 'app.runs_on'],
    [113, 'Everything runs on the Mac. Nothing is uploaded.', 'app.runs_on'],
    [117.5, 'swapstudio.', 'wordmark (maker)'],
]
MOMENTS = {
    1: 'wordmark "swapstudio." centred; squeezes into its period like an accordion (1.8-3.2)',
    3: f'the period stretches into the chat pill; my first message types into it: "{Q[0]}"',
    9: 'the pill lifts into a bubble; the chat panel grows round it, "Built in Claude Code"; helper agents pop in as rows: builders, reviewers, a harsh judge',
    13: 'terminal prints "an early logged session: 7.7 fps"; the hand-dots card redraws only 7.7 times a second (a drawing of the speed)',
    15: f'bubbles pop: "{Q[1]}", "{Q[2]}"',
    17: '7.7 swaps to 30 through a mask line; the dots move every frame. Lens opens for one beat: the digits turn 20 deg with their shadow on the panel [CROSSING flat->deep]',
    18: 'the digits press flat again [CROSSING deep->flat]; the real speed line types out under them',
    21: 'the judge\'s eight scores out of 10 pop as chips, one per sixteenth: 7 ... 9.7',
    24: f'bubble "{Q[6]}"; the chip swaps to 373 / 1000 (first round), then 578 / 1000 (second round)',
    27: 'the last reply: a double-click launcher "Open Studio"; the cursor double-clicks it',
    29: 'the launcher stretches into the Face Swap Studio window',
    30: '1 Face: photo cards pop with "Face found"; the cursor clicks one and the accent ring draws round it',
    33: '2 Model: model cards pop in (each is the model itself held flat); Finder slides in; long-press + drag a .glb; the tray lights; drop; "In hand"',
    37: 'lens opens: the model stands up out of its card, turns from its thumbnail angle to the camera, drops its shadow on the card; "On shelf" ticks down the cards [CROSSING flat->deep]',
    40: 'the model sinks back into its card; the lens closes [CROSSING deep->flat]',
    41: '3 Start: Face swap, Hand object, Shelf, Virtual camera switch on one per sixteenth; the pill says Ready',
    43: 'the cursor presses Start cam: label -> Stop, pill -> Starting, each through its own mask line',
    45: 'DROP. Start cam\'s accent shape floods out past the corners, then contracts into the "Running 30 fps" pill, uncovering the live card (AI effect tag)',
    48: 'the camera pushes onto the hand; the live card shrinks into the top-right corner and becomes the corner card on the exact frame',
    49: f'my hand clip pushes up from below on a flat card, {clip("live", t_of(49)):.2f} s in',
    51: 'the cursor slides onto my index fingertip and becomes its dot; the other 20 dots grow out along the bones; the bones draw',
    53: 'lens opens: the dots lift off the card to their real depth; the flat skeleton becomes the 3D hand, the clip still playing behind [CROSSING flat->deep]',
    54: 'my open hand is held out; the model I dragged in pops from zero above the palm, its shadow on the palm',
    57: f'PINCH ({PINCH:.2f} s): the accent ring closes round thumb and index; the model freezes; bubble "{Q[3]}"; the camera circles a quarter round',
    60: 'my quick sideways swings rock the model back and forth, as far as they moved (clicks on each swing)',
    65: f'BREAKDOWN. I let go ({LETGO:.2f} s): the spin coasts down (half-life 0.6 s)',
    66: 'a timeline strip grows out of the card: 47 s, 1412 frames, hand in 1294; the model presses flat into a tile on the strip and stays parked',
    67: f'the playhead scrubs ahead to the zoom (67-71); bubble "{Q[5]}"',
    72: '"zoom recognised before the fix: 0%"',
    74: f'thumb and index meet ({ZMET:.2f} s), the middle finger joins ({ZMID:.2f} s); in 3D (the tracker\'s own guess) the tips stay apart; the camera orbits to show the gap',
    75: 'the 3D hand presses flat onto the card, every joint onto its dot, the tips meet; "fingers met: pinch or zoom?" then "ZOOM: resizing" [CROSSING deep->flat]',
    76: '"measured in the picture, a prototype of the fix: 100%"; the pumping has started',
    77: 'BEAT RETURN. The hand lifts off the card into 3D, fingertips touching; the model steps out of its tile at the size the app\'s rule gives [CROSSING flat->deep]',
    78: 'pumping: the model grows and shrinks; a ruler ticks on each measured peak (beats ' + ', '.join(f'{p:.2f}' for p in peaks) + ')',
    83: f'I let go ({ZLET:.2f} s), the size stays; bubble "{Q[4]}"',
    84: f'two quick pinches ({TAP1:.2f} s and {TAP2:.2f} s, {TAP2 - TAP1:.2f} s apart) on beats 84 and 85: ring pulses; the model turns the short way to face the camera',
    89: 'the clip card sinks into the floor through a mask line while it still plays; then the 3D hand slerps to the shelf slice (open hand)',
    90: 'the shelf\'s flat tiles rise in a column; the held model flies back to its tile in an arc and flattens into its picture',
    93: f'the tile at my fingers lifts; I pinch ({PINCH:.2f} s again) and pull: the picture follows less and less, stretches, a band holds it; "Up to 10 on the shelf"',
    97: 'my first outward swing (95 px) only stretches it and lets it back',
    98: 'my second swing (126 px, over 2 x 56 px) pulls it free: the flat picture becomes the 3D model, overshoots and settles in my hand; an empty tile',
    101: 'the studio presses flat behind the corner card, which grows to fill the frame [CROSSING deep->flat]',
    102: 'it becomes one tile of a plain video call; the other tiles unfold like a paper map, initials only',
    103: 'the cursor opens the camera menu and picks "OBS Virtual Camera"; a tick draws itself',
    105: 'the tile\'s clip pushes to my hand passing in front of the swapped face; "Hands stay in front of the swapped face"',
    106: 'the camera zooms onto the AI effect tag',
    108: 'a lock chip rises: "Everything runs on the Mac; nothing is uploaded."',
    113: 'the grid folds back into the one tile; the tile shrinks into the period; the letters spring back out, landing on beat 119; last frame = first frame',
}
FACTS = [
    ('7.7 fps', 'speed.first_version ("an early logged session: 7.7 fps")'),
    ('30 (the speed digits)', 'speed.now'), ('the real speed line (typed whole)', 'speed.real_speed_line'),
    ('7, 8, 9, 9.5, 9.5, 9.5, 9.5, 9.7', 'making_of.judge_out_of_10'), ('373 / 1000, first round', 'making_of.judge_out_of_1000_first_round'),
    ('Built in Claude Code; builders, reviewers, a harsh judge', 'making_of.built_in'),
    ('47 s, 1412 frames, hand in 1294', 'making_of.hand_recording.length_seconds / frames / frames_with_the_hand'),
    ('zoom recognised before the fix: 0%', 'making_of.what_the_recording_found'),
    ('measured in the picture, a prototype of the fix: 100%', 'making_of.what_the_recording_found'),
    ('Up to 10 on the shelf', 'app.shelf_models_max (10) + app.what_it_does[5]'),
    ('Hands stay in front of the face', 'app.what_it_does[6]'),
    ('Everything runs on the Mac; nothing is uploaded.', 'app.runs_on'),
    ('7 typed messages', 'maker_quotes.lines[0..6] (maker said yes)'),
    ('Running 30 fps, Ready, Starting, Start cam, Stop, Face found, + Add photo, Pick from Finder, In hand, On shelf', "the app's start screen: NEEDS page.html / screen recording"),
    ('AI effect, fingers met: pinch or zoom?, ZOOM: resizing, OBS Virtual Camera', "the app's own words: NEEDS faceswap/ code to confirm spelling"),
]
NULLS = [k for k, v in F['making_of'].items() if v is None]
plan = {'bpm': BPM, 'beats': BEATS, 'duration': BEATS * B, 'sections': SECTIONS, 'slices': SLICES, 'voice': VOICE,
        'pump_peaks_beat': peaks, 'touches_s': {'pinch': PINCH, 'let_go': LETGO, 'zoom_met': ZMET, 'zoom_middle': ZMID, 'zoom_let_go': ZLET, 'tap1': TAP1, 'tap2': TAP2, 'shelf_pop': POP},
        'shelf_tile_px': 56, 'nulls': NULLS}
json.dump(plan, open(os.path.join(R, 'data/plan.json'), 'w'), indent=1)

md = ['# swapstudio: beat map (120 BPM, 120 beats, 60 s)', '',
      'Beat n starts at (n-1)/2 s. Clip times are moments in the hand recording, never text on screen.', '',
      '## Clip slices of the hand recording', '', '| slice | beats | in-point | out-point | locked by |', '|---|---|---|---|---|']
md += [f"| {s['name']} | {s['from_beat']}-{s['to_beat']} | {s['in_s']:.2f} s | {s['out_s']:.2f} s | {s['why']} |" for s in SLICES]
md += ['', f"Between the live and zoom slices the playhead scrubs visibly ({SLICES[0]['out_s']:.2f} s to {SLICES[1]['in_s']:.2f} s) on beats 47-48.",
       f"Zoom pump peaks land on beats {', '.join(f'{p:.2f}' for p in peaks)} (from the recording, not placed).", '',
       '## Beats', '', '| beat | t | section | what happens | voice |', '|---|---|---|---|---|']
sec = {b: f'{n} ({m})' for b, n, m in SECTIONS}
vo = {}
for b, line, _ in VOICE: vo.setdefault(int(b), []).append(line)
for b in range(1, BEATS + 1):
    if b in MOMENTS or b in sec or b in vo:
        md.append(f"| {b} | {t_of(b):.1f} | {sec.get(b, '')} | {MOMENTS.get(b, '')} | {' / '.join(vo.get(b, []))} |")
md += ['', '## Facts table (every on-screen number or claim, and its key)', '', '| on screen | facts.json key |', '|---|---|']
md += [f'| {a} | {k} |' for a, k in FACTS]
md += ['', f"**Still null, so their numbers stay out:** {', '.join(NULLS)}.",
       f"**Known but not placed by the prompt:** judge_out_of_1000_second_round = {F['making_of']['judge_out_of_1000_second_round']}, tests_passing_before_rebuild = {F['making_of']['tests_passing_before_rebuild']}.", '',
       '## Voice (Kokoro am_fenrir)', '', '| beat | line | key |', '|---|---|---|'] + [f'| {b} | {l} | {k} |' for b, l, k in VOICE]
open(os.path.join(R, 'review/beatmap.md'), 'w').write('\n'.join(md) + '\n')
print('slices', [(s['name'], s['in_s'], s['out_s']) for s in SLICES]); print('pump peaks (beats)', peaks); print('nulls', NULLS)
