# Smoke — painted evening

*Date: 2026-08-16*
*Gate: `/smoke-check` lean (no chat gates)*
*Path: title → 开一间 → valley bed → 做/喊 → kitchen → mine → sit*
*Verdict: **PASS***

## Environment

- Engine: Godot 4.4.1 (playable client). Node/ws stays authority.
- Tests: `npm test` (`godot/project.test.ts` + sim/look). No GdUnit4 runner.
- CI: none required for this lean gate.
- QA plan: not used. Path is the painted evening, not more beeps.

## What ran

One Play-path (`res://scenes/play_smoke.tscn`, no server):

```
SMOKE_TITLE
SMOKE_ROOM
SMOKE_VALLEY
SMOKE_DO
SMOKE_SHOUT
SMOKE_KITCHEN
SMOKE_MINE
SMOKE_SIT
SMOKE_EVENING_OK
```

Supporting tokens (same night, already wired):

```
PLAY_ZONE_VALLEY
PLAY_ZONE_MINE
PLAY_ZONE_KITCHEN
PLAY_FISH_MARK
PLAY_EVENING_OK
PLAY_EAR_DUSK
PLAY_EAR_ACT
PLAY_EAR_SHOUT
PLAY_EAR_SIT
PLAY_EAR_OK
PLAY_KITCHEN_BED
PLAY_KITCHEN_POT
PLAY_KITCHEN_OK
PLAY_MINE_BED
PLAY_MINE_ORE
PLAY_MINE_OK
PLAY_SLEEP_SIT
PLAY_SLEEP_VALLEY
PLAY_SLEEP_OK
PLAY_COAT_WALK
PLAY_COAT_SIT
PLAY_COAT_OK
PLAY_PLACE_HEARTH
PLAY_PLACE_CHOP
PLAY_PLACE_VEIN
PLAY_PLACE_OK
```

Zone switches were not silent: valley dusk → kitchen hearth → mine vein → sit dusk.

## Fixes this gate

None. No broken play-path tokens. No silent zone switch. `play.gd` untouched. HTML5 not re-exported.

## Not this gate

- More beeps / sample pack
- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`) — Blocked / human
- Recrop FAIL stickers
- Restyle `bed-valley.png`

## Sign-off

`/smoke-check` lean. One painted language. No 魂. No Don't Starve chrome.
