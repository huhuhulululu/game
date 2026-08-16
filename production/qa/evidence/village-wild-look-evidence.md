# Evidence — farm, fortune, board, wild

*Story: `production/epics/r1-village-wild/story-001-farm-fortune-board-wild.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: one dusk language for 田 / 卦棚 / 看板 / 荒野*

## What this slice covers

- `ValleyLogic.show_crops` sits `prop-sprout` / `prop-ripe` from snap `plots` via `_sit_plot`
- 卦棚 / 黎明看板 sit `prop-fortune` / `prop-dawn` on `Y` / `B`
- Wilderness sits `bed-wild.png`; does not hang `prop-tree`
- New props are magenta-key with real `a=0`
- `play_village.tscn` feeds snaps into `play.tscn`
- `src/sim` / `src/scenes` do not gain these look names
- FAIL cover props stay off the valley

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_village.tscn`, no server):

```
PLAY_CROP_SIT
PLAY_FORTUNE_SIT
PLAY_DAWN_SIT
PLAY_WILD_BED
PLAY_VILLAGE_OK
```

`npm test`: 112 pass.

## Not this slice

- Kitchen / mine tile restyle
- Recrop FAIL stickers
- Stall / anvil / pine on the valley floor

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
