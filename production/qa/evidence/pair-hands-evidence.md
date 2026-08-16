# Evidence — pair hands

*Story: `production/epics/r1-togetherness/story-002-pair-hands.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: pair-fish and dual 做 as two coats, not a bonus stat*

## What this slice covers

- Pair-fish: both fish poses on `bed-valley.png`, distance `< 90`, prompt 两人同钓
- Dual 做 at forge (smith) and stall (booth + existing fish sheet)
- Dual sleep: two sit poses on the valley bed; no indoor sleep zone
- Plaque stays `日 · 季 · 时 · 金`. No bond / pair+ / 成对
- `src/sim` does not gain Play look names
- Two-iPhone playtest stays later

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_hands.tscn`, no server):

```
PLAY_PAIR_FISH
PLAY_PAIR_FORGE
PLAY_PAIR_STALL
PLAY_PAIR_SLEEP
PLAY_HANDS_OK
```

`npm test`: 119 pass.

## Not this slice

- Two-iPhone human playtest
- Recrop FAIL stickers
- New valley props
- Pair quality / bond HUD

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
