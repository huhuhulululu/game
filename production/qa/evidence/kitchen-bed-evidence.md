# Evidence — kitchen bed

*Story: `production/epics/r1-evening-places/story-001-kitchen-bed.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: one dusk kitchen, not ink stickers on tiled wood*

## What this slice covers

- `ZoneMap` sits `bed-kitchen.png` for kitchen (not tiled `tex-wood` floor)
- Stations sit `prop-hearth` / `prop-chop` / `prop-oven` / `prop-serve` / `prop-cool` / `prop-bin` / `prop-shelf` / `prop-way`
- Old ink pack (`prop-pot`, `prop-cut`, …) stays on disk, not hung
- `play_kitchen.tscn` feeds a kitchen snap into `play.tscn`
- `src/sim` / `src/scenes` do not gain these look names
- FAIL cover props stay off the kitchen

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_kitchen.tscn`, no server):

```
PLAY_KITCHEN_BED
PLAY_KITCHEN_POT
PLAY_KITCHEN_OK
```

`npm test`: 113 pass.

## Not this slice

- Mine bed
- Forge / stall on the valley
- Sleep look
- Recrop FAIL stickers

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
