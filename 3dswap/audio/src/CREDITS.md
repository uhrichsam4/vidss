# Audio credits - 3dswap launch film

All files below are real recorded / produced audio taken from third-party repositories (nothing synthesised by us). Each entry keeps the original file (original extension, or `_orig.wav`) plus a `.wav` converted to 44.1 kHz / stereo / 16-bit PCM next to it. `_sN.wav` files are individual hits cut from multi-hit sprite files using the slice table in tidewater `src/audio/soundBank.js`.

Licences accepted: CC0 1.0, CC-BY (attribution below). Retrieved 2026-09-27.

## Required on-screen / description attribution (CC-BY items)

```
Music: menu_intro_music (Godot TPS demo, github.com/godotengine/tps-demo) by Christian Fernando Perucchi - CC BY 3.0 (creativecommons.org/licenses/by/3.0)   [if song01 is used]
Music: mr_mrs_robot (Godot demo projects) by Juan Linietsky - CC BY   [if song02 is used]
Sound effects: Godot TPS demo by Juan Linietsky & Fernando Miguel Calabró - CC BY 3.0   [if any *_tps_* SFX is used]
```
All other files are CC0 (no attribution required; credited here anyway).

## Songs (`music/`)

### song01_tps_menu_intro_music
- Files: `music/song01_tps_menu_intro_music.ogg`, `music/song01_tps_menu_intro_music.wav`
- Source: https://github.com/godotengine/tps-demo - `menu/menu_intro_music.ogg`
- Author: Christian Fernando Perucchi
- Licence: **CC-BY 3.0**
- Licence statement: `LICENSE.md` in godotengine/tps-demo: "Music Copyright (c) 2018 Christian Fernando Perucchi. Distributed under the terms of the Creative Commons Attribution License version 3.0 (CC-BY 3.0)".
- Tempo: 117.5 (librosa beat grid, very steady; first beat 0.07 s; bar = 2.04 s); duration 96.04 s
- Structure (4/4 bars from the beat grid, energy = full-band / sub <150 Hz):
  - 0.0-8.0 s intro; accent hit (cymbal/crash, high band spike) at **8.0 s**
  - 8-14 s moderate groove; 14-30 s lower-energy section (thinner highs)
  - 32.1 s lift (sub bass up) through 38 s
  - **40.1-46.1 s breakdown** (mids drop ~10 dB, quietest part of the song) -> build 46.1-48 s
  - **DROP at 48.07 s**: biggest bar in the track (crash + full sub); full energy 48-82 s, highlights 56, 60, 64 (crash), 76, 80 s
  - 82-88 s eases off, 88 s back up, ends 96 s
  Tip: a 28 s window **20.06 -> 48.07 s** contains the breakdown (40-46 s) and lands exactly on the drop at the end; or start at ~26 s so the drop hits ~22 s in (beat ~44 at 120 BPM). Time-stretch 117.45 -> 120 BPM = +2.2 % (inaudible).

### song02_mr_mrs_robot
- Files: `music/song02_mr_mrs_robot.ogg`, `music/song02_mr_mrs_robot.wav`
- Source: https://github.com/godotengine/godot-demo-projects - `misc/2.5d/assets/mr_mrs_robot.ogg`
- Author: Juan Linietsky
- Licence: **CC-BY (version not stated; treat as CC BY 3.0/4.0 - attribution required)**
- Licence statement: `misc/2.5d/README.md`, section "Music license": "`assets/mr_mrs_robot.ogg` Copyright (c) circa 2008 Juan Linietsky, CC-BY: Attribution."
- Tempo: 112.3 (steady; first beat 0.58 s; bar = 2.14 s); duration 168.93 s
- Electronic/robotic groove, fairly even loudness (less dramatic dynamics than song01).
  - 0-33 s intro/groove building gently; 33.1 s fuller section (energy up) through ~70 s
  - small dip bar at 72.1 s, full again 74-87 s
  - **87-104 s quieter breakdown** (returns to intro texture), rebuild 104-124 s
  - 124.1 s full section again (peaks 141-145 s), dip at 145.8 s, full 148-161 s, fades 161-169 s
  Stretch 112.3 -> 120 BPM = +6.8 % (noticeable but usable) or use at native tempo.

### song03_project_utopia
- Files: `music/song03_project_utopia.ogg`, `music/song03_project_utopia.wav`
- Source: https://github.com/mrdoob/three.js - `examples/sounds/Project_Utopia.ogg`
- Author: congusbongus (via OpenGameArt)
- Licence: **CC0 1.0**
- Licence statement: `examples/sounds/readme.txt` in mrdoob/three.js: "Music from opengameart, licensed under CC0 1.0 Universal (CC0 1.0) Public Domain Dedication - Project Utopia by congusbongus". (Other two tracks in that folder are CC BY-NC-SA - NOT used.)
- Tempo: ~129 (librosa; bar grid slightly irregular - verify by ear); duration 18.32 s (seamless loop)
- Seamless loop, bass-heavy with very little top end (>4 kHz band ~-60 dB). Too short on its own (loop x2 = 36.6 s) and has no build/drop; keep as a fallback/under-bed only.

## Sound effects (`sfx/`)

Prefix = intended use: `click_`/`tick_` UI clicks, `pop_` item appear, `whoosh_` camera moves, `snap_` iris blades / mechanical clack, `thud_` soft land, `twang_` rubber-band stretch-release, `boom_` drop impact, `swell_`/`glass_` glassy swell/riser, `bed_` texture.

| Name | Files | Source repo - path | Author | Licence | Description |
|---|---|---|---|---|---|
| click_kenney_toggle | `click_kenney_toggle.ogg`, `click_kenney_toggle.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/toggle.ogg` | Kenney (kenney.nl) | CC0 1.0 | ultra-short soft UI tick (10 ms) |
| click_kenney_rotate | `click_kenney_rotate.ogg`, `click_kenney_rotate.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/rotate.ogg` | Kenney (kenney.nl) | CC0 1.0 | short low soft click (30 ms) |
| click_kenney_placement_a | `click_kenney_placement_a.ogg`, `click_kenney_placement_a.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/placement-a.ogg` | Kenney (kenney.nl) | CC0 1.0 | soft tactile click/tap (100 ms) |
| click_kenney_placement_b | `click_kenney_placement_b.ogg`, `click_kenney_placement_b.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/placement-b.ogg` | Kenney (kenney.nl) | CC0 1.0 | soft tactile click/tap, lower |
| click_kenney_placement_c | `click_kenney_placement_c.ogg`, `click_kenney_placement_c.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/placement-c.ogg` | Kenney (kenney.nl) | CC0 1.0 | soft tactile click/tap |
| click_kenney_placement_d | `click_kenney_placement_d.ogg`, `click_kenney_placement_d.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/placement-d.ogg` | Kenney (kenney.nl) | CC0 1.0 | soft tactile click/tap, lowest |
| tick_sonicpi_elec_tick | `tick_sonicpi_elec_tick.flac`, `tick_sonicpi_elec_tick.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_tick.flac` | freesound #13113 by looppool (edited by Sonic Pi project) | CC0 1.0 | tiny electronic tick (20 ms) |
| tick_sonicpi_elec_blip | `tick_sonicpi_elec_blip.flac`, `tick_sonicpi_elec_blip.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_blip.flac` | freesound #13121 by looppool (edited by Sonic Pi project) | CC0 1.0 | bright blip |
| tick_sonicpi_elec_blip2 | `tick_sonicpi_elec_blip2.flac`, `tick_sonicpi_elec_blip2.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_blip2.flac` | freesound #13120 by looppool (edited by Sonic Pi project) | CC0 1.0 | bright blip, variant |
| tick_sonicpi_elec_twip | `tick_sonicpi_elec_twip.flac`, `tick_sonicpi_elec_twip.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_twip.flac` | freesound #13094 by looppool (edited by Sonic Pi project) | CC0 1.0 | very bright short tick |
| tick_sonicpi_tbd_perc_blip | `tick_sonicpi_tbd_perc_blip.flac`, `tick_sonicpi_tbd_perc_blip.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_perc_blip.flac` | The Black Dog (donated) | CC0 1.0 | soft muted blip |
| tick_sonicpi_tbd_perc_tap_1 | `tick_sonicpi_tbd_perc_tap_1.flac`, `tick_sonicpi_tbd_perc_tap_1.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_perc_tap_1.flac` | The Black Dog (donated) | CC0 1.0 | very quiet tap (-19 dBFS peak) |
| tick_sonicpi_tbd_perc_tap_2 | `tick_sonicpi_tbd_perc_tap_2.flac`, `tick_sonicpi_tbd_perc_tap_2.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_perc_tap_2.flac` | The Black Dog (donated) | CC0 1.0 | soft tap |
| tick_sonicpi_hat_tap | `tick_sonicpi_hat_tap.flac`, `tick_sonicpi_hat_tap.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/hat_tap.flac` | freesound #674296 by TheEndOfACycle (edited by Sonic Pi project) | CC0 1.0 | tiny closed-hat tick |
| pop_sonicpi_elec_pop | `pop_sonicpi_elec_pop.flac`, `pop_sonicpi_elec_pop.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_pop.flac` | freesound #13134 by looppool (edited by Sonic Pi project) | CC0 1.0 | short pop (90 ms) |
| pop_sonicpi_elec_plip | `pop_sonicpi_elec_plip.flac`, `pop_sonicpi_elec_plip.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_plip.flac` | freesound #13093 by looppool (edited by Sonic Pi project) | CC0 1.0 | rounded plip/pop |
| pop_sonicpi_elec_blup | `pop_sonicpi_elec_blup.flac`, `pop_sonicpi_elec_blup.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_blup.flac` | freesound #13092 by looppool (edited by Sonic Pi project) | CC0 1.0 | deeper bubbly blup |
| pop_sonicpi_elec_ping | `pop_sonicpi_elec_ping.flac`, `pop_sonicpi_elec_ping.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_ping.flac` | freesound #13119 by looppool (edited by Sonic Pi project) | CC0 1.0 | small ping (pop with pitch) |
| whoosh_sonicpi_ambi_swoosh | `whoosh_sonicpi_ambi_swoosh.flac`, `whoosh_sonicpi_ambi_swoosh.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/ambi_swoosh.flac` | freesound #169867 by Halgrimm (edited by Sonic Pi project) | CC0 1.0 | soft slow swoosh, 1.85 s, peak ~0.96 s |
| whoosh_sonicpi_perc_swoosh | `whoosh_sonicpi_perc_swoosh.flac`, `whoosh_sonicpi_perc_swoosh.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/perc_swoosh.flac` | freesound #415580 by hullum (edited by Sonic Pi project) | CC0 1.0 | quick bright swoosh, 0.6 s |
| whoosh_sonicpi_perc_swash | `whoosh_sonicpi_perc_swash.flac`, `whoosh_sonicpi_perc_swash.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/perc_swash.flac` | freesound #60009 by qubodup (edited by Sonic Pi project) | CC0 1.0 | very short swish, 0.3 s |
| whoosh_sonicpi_ambi_dark_woosh | `whoosh_sonicpi_ambi_dark_woosh.flac`, `whoosh_sonicpi_ambi_dark_woosh.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/ambi_dark_woosh.flac` | freesound #27281 by EcoDTR (edited by Sonic Pi project) | CC0 1.0 | dark low woosh, 3.7 s, peak ~1.3 s (camera sweep) |
| whoosh_tidewater_rod_swish | `whoosh_tidewater_rod_swish.ogg`, `whoosh_tidewater_rod_swish.wav`, `whoosh_tidewater_rod_swish_s1.wav`, `whoosh_tidewater_rod_swish_s2.wav`, `whoosh_tidewater_rod_swish_s3.wav`, `whoosh_tidewater_rod_swish_s4.wav`, `whoosh_tidewater_rod_swish_s5.wav` | local clone /home/user/vidss/game-clips/src/tidewater (MIT code) - `public/audio/rod_swish.ogg` | freesound #371313 by Mrthenoronha, #725426 by mwchristian95 | CC0 1.0 | sprite: 5 air swishes (fishing-rod cast); also cut into _s1.._s5 |
| snap_sonicpi_perc_snap | `snap_sonicpi_perc_snap.flac`, `snap_sonicpi_perc_snap.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/perc_snap.flac` | freesound #109400 by SoundCollectah (edited by Sonic Pi project) | CC0 1.0 | finger-snap / crisp snap |
| snap_sonicpi_perc_snap2 | `snap_sonicpi_perc_snap2.flac`, `snap_sonicpi_perc_snap2.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/perc_snap2.flac` | freesound #158615 by Peram (edited by Sonic Pi project) | CC0 1.0 | crisp snap, variant |
| snap_sonicpi_elec_wood | `snap_sonicpi_elec_wood.flac`, `snap_sonicpi_elec_wood.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_wood.flac` | freesound #13135 by looppool (edited by Sonic Pi project) | CC0 1.0 | woody clack |
| snap_sonicpi_elec_flip | `snap_sonicpi_elec_flip.flac`, `snap_sonicpi_elec_flip.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_flip.flac` | freesound #13114 by looppool (edited by Sonic Pi project) | CC0 1.0 | tiny flip/clack (70 ms) |
| snap_kenney_fps_weapon_change | `snap_kenney_fps_weapon_change.ogg`, `snap_kenney_fps_weapon_change.wav` | https://github.com/KenneyNL/Starter-Kit-FPS - `sounds/weapon_change.ogg` | Kenney (kenney.nl) | CC0 1.0 | metallic mechanical ratchet/clack (0.4 s) |
| snap_tidewater_bail_click | `snap_tidewater_bail_click.ogg`, `snap_tidewater_bail_click.wav`, `snap_tidewater_bail_click_s1.wav`, `snap_tidewater_bail_click_s2.wav`, `snap_tidewater_bail_click_s3.wav`, `snap_tidewater_bail_click_s4.wav` | local clone /home/user/vidss/game-clips/src/tidewater (MIT code) - `public/audio/bail_click.ogg` | freesound #523282 by MrFossy (Foley_TapeMeasure_ClickLock) | CC0 1.0 | sprite: 4 small sprung-metal click-locks (great for iris blades); also cut into _s1.._s4 |
| snap_tps_door_open_close | `snap_tps_door_open_close_orig.wav`, `snap_tps_door_open_close.wav` | https://github.com/godotengine/tps-demo - `door/open_close.wav` | Juan Linietsky, Fernando Miguel Calabró | CC-BY 3.0 | sci-fi door mechanism open/close, metallic (2.3 s) |
| thud_kenney_removal_a | `thud_kenney_removal_a.ogg`, `thud_kenney_removal_a.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/removal-a.ogg` | Kenney (kenney.nl) | CC0 1.0 | soft low thud/knock (0.44 s) |
| thud_kenney_removal_c | `thud_kenney_removal_c.ogg`, `thud_kenney_removal_c.wav` | https://github.com/KenneyNL/Starter-Kit-City-Builder - `sounds/removal-c.ogg` | Kenney (kenney.nl) | CC0 1.0 | soft low thud/knock, variant |
| thud_kenney_platformer_land | `thud_kenney_platformer_land.ogg`, `thud_kenney_platformer_land.wav` | https://github.com/KenneyNL/Starter-Kit-3D-Platformer - `sounds/land.ogg` | Kenney (kenney.nl) | CC0 1.0 | very soft quiet land tap (-21 dBFS) |
| thud_tps_land | `thud_tps_land_orig.wav`, `thud_tps_land.wav` | https://github.com/godotengine/tps-demo - `player/audio/land.wav` | Juan Linietsky, Fernando Miguel Calabró | CC-BY 3.0 | footstep-style landing thud (0.45 s) |
| thud_sonicpi_elec_soft_kick | `thud_sonicpi_elec_soft_kick.flac`, `thud_sonicpi_elec_soft_kick.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_soft_kick.flac` | freesound #13142 by looppool (edited by Sonic Pi project) | CC0 1.0 | soft muted kick-thud |
| thud_sonicpi_elec_hollow_kick | `thud_sonicpi_elec_hollow_kick.flac`, `thud_sonicpi_elec_hollow_kick.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_hollow_kick.flac` | freesound #13099 by looppool (edited by Sonic Pi project) | CC0 1.0 | hollow thud |
| thud_sonicpi_drum_heavy_kick | `thud_sonicpi_drum_heavy_kick.flac`, `thud_sonicpi_drum_heavy_kick.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/drum_heavy_kick.flac` | freesound #4832 by Zajo (edited by Sonic Pi project) | CC0 1.0 | acoustic heavy kick thud |
| twang_sonicpi_elec_twang | `twang_sonicpi_elec_twang.flac`, `twang_sonicpi_elec_twang.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_twang.flac` | freesound #13136 by looppool (edited by Sonic Pi project) | CC0 1.0 | boingy twang (rubber-band release) |
| twang_sonicpi_elec_bong | `twang_sonicpi_elec_bong.flac`, `twang_sonicpi_elec_bong.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/elec_bong.flac` | freesound #13137 by looppool (edited by Sonic Pi project) | CC0 1.0 | rubbery bong/boing |
| twang_tidewater_line_snap | `twang_tidewater_line_snap.ogg`, `twang_tidewater_line_snap.wav`, `twang_tidewater_line_snap_s1.wav`, `twang_tidewater_line_snap_s2.wav`, `twang_tidewater_line_snap_s3.wav`, `twang_tidewater_line_snap_s4.wav` | local clone /home/user/vidss/game-clips/src/tidewater (MIT code) - `public/audio/line_snap.ogg` | freesound #537084 by khenshom (guitar string snap) | CC0 1.0 | sprite: 4 strings snapping under tension (stretch-release pop); also cut into _s1.._s4 |
| boom_sonicpi_bd_boom | `boom_sonicpi_bd_boom.flac`, `boom_sonicpi_bd_boom.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/bd_boom.flac` | freesound #157245 by Snapper4298 (edited by Sonic Pi project) | CC0 1.0 | deep sub boom (centroid ~70 Hz), 1.7 s |
| boom_sonicpi_misc_cineboom | `boom_sonicpi_misc_cineboom.flac`, `boom_sonicpi_misc_cineboom.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/misc_cineboom.flac` | freesound #177242 by Northern_Monkey (edited by Sonic Pi project) | CC0 1.0 | cinematic boom with long tail, 7.9 s |
| boom_sonicpi_bass_drop_c | `boom_sonicpi_bass_drop_c.flac`, `boom_sonicpi_bass_drop_c.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/bass_drop_c.flac` | freesound #165320 by ani_music (edited by Sonic Pi project) | CC0 1.0 | pitch-dropping bass hit, 2.4 s |
| boom_sonicpi_perc_impact1 | `boom_sonicpi_perc_impact1.flac`, `boom_sonicpi_perc_impact1.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/perc_impact1.flac` | freesound #415578 by hullum (edited by Sonic Pi project) | CC0 1.0 | sharp impact hit, 1.1 s |
| boom_sonicpi_perc_impact2 | `boom_sonicpi_perc_impact2.flac`, `boom_sonicpi_perc_impact2.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/perc_impact2.flac` | freesound #415581 by hullum (edited by Sonic Pi project) | CC0 1.0 | impact hit, variant |
| boom_kenney_racing_impact | `boom_kenney_racing_impact.ogg`, `boom_kenney_racing_impact.wav` | https://github.com/KenneyNL/Starter-Kit-Racing - `audio/impact.ogg` | Kenney (kenney.nl) | CC0 1.0 | low physical impact, 0.65 s |
| swell_sonicpi_ambi_glass_rub | `swell_sonicpi_ambi_glass_rub.flac`, `swell_sonicpi_ambi_glass_rub.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/ambi_glass_rub.flac` | freesound #198403 by ani_music (edited by Sonic Pi project) | CC0 1.0 | rubbed wine-glass tone swelling in, peak ~1.5 s |
| swell_sonicpi_ambi_glass_hum | `swell_sonicpi_ambi_glass_hum.flac`, `swell_sonicpi_ambi_glass_hum.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/ambi_glass_hum.flac` | freesound #35391 by kaligari (edited by Sonic Pi project) | CC0 1.0 | glass hum drone, 10 s, peak ~4.4 s |
| swell_sonicpi_tbd_pad_1 | `swell_sonicpi_tbd_pad_1.flac`, `swell_sonicpi_tbd_pad_1.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_pad_1.flac` | The Black Dog (donated) | CC0 1.0 | soft pad swell, 2.0 s, peak ~1.7 s |
| swell_sonicpi_tbd_pad_2 | `swell_sonicpi_tbd_pad_2.flac`, `swell_sonicpi_tbd_pad_2.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_pad_2.flac` | The Black Dog (donated) | CC0 1.0 | airy pad swell, 3.2 s, peak ~2.4 s |
| swell_sonicpi_tbd_pad_3 | `swell_sonicpi_tbd_pad_3.flac`, `swell_sonicpi_tbd_pad_3.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_pad_3.flac` | The Black Dog (donated) | CC0 1.0 | pad swell, 3.0 s, peak ~2.4 s |
| swell_sonicpi_tbd_pad_4 | `swell_sonicpi_tbd_pad_4.flac`, `swell_sonicpi_tbd_pad_4.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_pad_4.flac` | The Black Dog (donated) | CC0 1.0 | pad swell, 2.5 s, peak ~1.4 s |
| swell_tps_charge | `swell_tps_charge_orig.wav`, `swell_tps_charge.wav` | https://github.com/godotengine/tps-demo - `enemies/red_robot/audio/charge.wav` | Juan Linietsky, Fernando Miguel Calabró | CC-BY 3.0 | energy charge-up riser, 2.4 s, peak ~1.6 s |
| swell_sonicpi_vinyl_rewind | `swell_sonicpi_vinyl_rewind.flac`, `swell_sonicpi_vinyl_rewind.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/vinyl_rewind.flac` | freesound #162493 by TasmanianPower (edited by Sonic Pi project) | CC0 1.0 | rewind sweep (alt. riser/transition) |
| glass_godot_ding | `glass_godot_ding_orig.wav`, `glass_godot_ding.wav` | https://github.com/godotengine/godot-demo-projects - `audio/audio_effects/sfx/Ding.wav` | MatthewWong (freesound #361564) | CC0 1.0 | clean glassy ding with 2.8 s ring (reverse it for a glass riser) |
| tick_godot_metronome_quartz_hi | `tick_godot_metronome_quartz_hi_orig.wav`, `tick_godot_metronome_quartz_hi.wav` | https://github.com/godotengine/godot-demo-projects - `audio/rhythm_game/music/Perc_MetronomeQuartz_hi.wav` | Ludwig Peter Müller | CC0 1.0 | recorded quartz metronome tick (quiet, -15 dBFS) |
| bed_sonicpi_tbd_fxbed_loop | `bed_sonicpi_tbd_fxbed_loop.flac`, `bed_sonicpi_tbd_fxbed_loop.wav` | https://github.com/sonic-pi-net/sonic-pi - `etc/samples/tbd_fxbed_loop.flac` | The Black Dog (donated) | CC0 1.0 | 7.4 s textural FX bed loop (under-bed / breakdown texture) |

### Licence statements for the SFX sources

- **https://github.com/KenneyNL/Starter-Kit-City-Builder**: `README.md` / `LICENSE.md` in the repo: "Assets included in this package (2D sprites, 3D models and sound effects) are CC0 licensed" (code MIT).
- **https://github.com/sonic-pi-net/sonic-pi**: `etc/samples/README.md` in sonic-pi-net/sonic-pi: "All other samples in this directory are from http://freesound.org and have also been placed in the public domain via the Creative Commons 0 License" (tbd_* samples: "Donated by The Black Dog under a CC0 license"). Repo code is MIT (`LICENSE.md`).
- **local clone /home/user/vidss/game-clips/src/tidewater (MIT code)**: `public/audio/CREDITS.md` in tidewater: "Every sound in this folder is a real recording from Freesound, released under Creative Commons 0"; also top-level `CREDITS.md`.
- **https://github.com/KenneyNL/Starter-Kit-FPS**: `README.md`: "Assets included in this package (2D sprites, 3D models and sound effects) are CC0 licensed".
- **https://github.com/godotengine/tps-demo**: `LICENSE.md` in godotengine/tps-demo: "All assets Copyright (c) 2018 Juan Linietsky, Fernando Miguel Calabró. Distributed under the terms of the Creative Commons Attribution License version 3.0 (CC-BY 3.0)".
- **https://github.com/KenneyNL/Starter-Kit-3D-Platformer**: `README.md`: "Sound effects (CC0 licensed)" and "Assets included in this package (2D sprites, 3D models and sound effects) are CC0 licensed".
- **https://github.com/KenneyNL/Starter-Kit-Racing**: `README.md`: "3D Models & sounds (CC0 licensed)" / "Assets included in this package (2D sprites, 3D models and sound effects) are CC0 licensed".
- **https://github.com/godotengine/godot-demo-projects**: `audio/audio_effects/README.md`: "All sound effects are from Freesound and licensed under CC0" - "Ding by MatthewWong".
- **https://github.com/godotengine/godot-demo-projects**: `audio/rhythm_game/README.md`: "The metronome sound was recorded by Ludwig Peter Müller in December 2020 under the Creative Commons CC0 1.0 Universal license."

- Kenney sounds from the starter kits are from Kenney's CC0 packs (the starter-kit READMEs state the bundled sound effects are CC0). Full Kenney packs (Interface Sounds, UI Audio, Impact Sounds, Digital Audio) were not found mirrored in any reachable GitHub repo with a clear licence, so only the sounds shipped in the official KenneyNL starter kits are used.
- Sonic Pi samples: the per-sample freesound source IDs above are taken from `etc/samples/README.md` in sonic-pi-net/sonic-pi.

## Checked and NOT used (licence unclear or incompatible)

| File | Why skipped |
|---|---|
| game-clips/src/tower_game/assets/bgm.mp3 (+ drop/rotate/game-over) | Repo is MIT (code) with no audio credits. ID3 tag says "Caketown" by Matthew Pablo (2012) - third-party music whose licence is not stated in the repo; also 8 kHz/16 kb/s chiptune. Unclear - not copied. |
| game-clips/src/LittleJS/examples/shorts/song.mp3 | MIT repo; no credit/provenance for the song anywhere (COPYRIGHT.txt lists no audio). Unclear - not copied. |
| godot-demo-projects `audio/bpm_sync/the_comeback2.ogg`, `audio/rhythm_game/music/the_comeback2.ogg` | No author/licence given for the song (only repo-wide MIT). Unclear - not copied. |
| godot-demo-projects `2d/platformer/music.ogg` ("Pompy" by madbr) | Author credited, no licence stated. Not copied. |
| godot-demo-projects `audio/audio_effects/sfx/music_monkeys_spinning_monkeys.ogg` | Kevin MacLeod, CC BY 3.0 (OK licence) but quirky ukulele style - not a fit, not copied. |
| godot-demo-projects `3d/truck_town/vehicles/*.wav`, `3d/ragdoll_physics/sounds/*.wav` | No credits/licence for these sounds. Not copied. |
| godotengine/tps-demo `level/level_music.ogg` | CC BY 3.0 (OK) but 152 BPM action loop, out of the 110-130 range. Not copied (available if wanted). |
| three.js `examples/sounds/376737_Skullbeatz...`, `358232_j_s_song...` | CC BY-NC-SA (non-commercial). Rejected. |
| pythonarcade/arcade `resources/assets/music/1918.mp3`, `funkyrobot.mp3` | readme only says "Music from Anttis" + a reddit link; no licence text. Unclear - not copied. (Its Kenney SFX are CC0 but were redundant.) |
| bevyengine/bevy `assets/sounds/Windless Slopes.ogg` | Not listed in bevy CREDITS.md. Unclear. |
| raylib `examples/audio/resources/country.mp3` | CC0 (OK) but country style - not a fit. |
| npm `uisfx` (romainsimon/uisfx) | CC0 but procedurally synthesised, not recorded - excluded per brief. |
| npm `react-sounds` (e3ntity/react-sounds) | MIT repo, but no provenance for the sound files. Unclear. |
| kaplayjs/kaplay `examples/sounds/*`, excaliburjs/Excalibur sandbox audio, phaser3-examples audio | No per-asset licence/credits. Not copied. |
