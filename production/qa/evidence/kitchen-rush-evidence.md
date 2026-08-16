# Evidence — kitchen rush

*Story: `production/epics/r1-evening-places/story-005-kitchen-rush.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: two coats at kitchen stations; Overcooked stays in the kitchen*

## What this slice covers

- Rush place `厨房 · 堂口热` on `bed-kitchen.png` with hearth / chop / oven / serve
- Dual 做 uses the existing chop pose
- Order slips are wood and kitchen-only; leftover tickets do not hang on the valley
- Plaque stays `日 · 季 · 时 · 金`. No combo / bond
- `src/sim` does not gain Play look names
- Two-iPhone playtest stays later

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_rush.tscn`, no server):

```
PLAY_RUSH_HOT
PLAY_RUSH_DO
PLAY_RUSH_ONLY
PLAY_RUSH_OK
```

`npm test`: 120 pass.

## Not this slice

- Two-iPhone human playtest
- Recrop FAIL stickers
- New kitchen / valley props
- New character pack

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
