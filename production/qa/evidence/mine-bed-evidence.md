# Evidence — mine bed

*Story: `production/epics/r1-evening-places/story-002-mine-bed.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: one dusk mine, not ink ore on tiled stone*

## What this slice covers

- `ZoneMap` sits `bed-mine.png` for mine (not tiled `tex-stone` floor)
- Ore / stairs / chest / door sit `prop-vein` / `prop-steps` / `prop-cache` / `prop-mouth`
- Old ink pack (`prop-ore`, `prop-stairs`, `prop-door-open`) stays on disk, not hung in the mine
- `play_mine.tscn` feeds a mine snap into `play.tscn`
- `src/sim` / `src/scenes` do not gain these look names
- FAIL cover props stay off the mine
- Mine template rows are 16 wide so Play does not index past a short wall

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_mine.tscn`, no server):

```
PLAY_MINE_BED
PLAY_MINE_ORE
PLAY_MINE_OK
```

`npm test`: 114 pass.

## Not this slice

- Kitchen restyle
- Forge / stall on the valley
- Sleep look
- Recrop FAIL stickers

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
