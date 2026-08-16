# Evidence — forge and stall

*Story: `production/epics/r1-evening-places/story-003-forge-stall.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: dusk smith / booth on the valley, not hung anvil / stall*

## What this slice covers

- Valley sits `prop-smith.png` on `Y` and `prop-booth.png` on `S` via `_sit_plot`
- 卦棚 stays `prop-fortune` on `G`; dawn stays `prop-dawn` on `B`
- Old `prop-anvil` / `prop-stall` stay on disk, not hung
- `play_forge.tscn` feeds a valley snap into `play.tscn`
- `src/sim` / `src/scenes` do not gain these look names
- FAIL cover props stay off the valley

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_forge.tscn`, no server):

```
PLAY_FORGE_SIT
PLAY_STALL_SIT
PLAY_FORGE_OK
```

Village path still prints `PLAY_FORTUNE_SIT` `PLAY_DAWN_SIT` `PLAY_VILLAGE_OK`.

`npm test`: 115 pass.

## Not this slice

- Kitchen / mine restyle
- Sleep look
- Recrop FAIL stickers

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
