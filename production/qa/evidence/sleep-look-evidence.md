# Evidence — sleep look

*Story: `production/epics/r1-evening-places/story-004-sleep.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: cover-coat sit on the valley bed, not a second indoor room*

## What this slice covers

- Sleep uses existing `char-warm-sit.png` / `char-pine-sit.png` on `bed-valley.png`
- Cabin stays painted on the valley bed; no indoor sleep zone, no `bed-sleep` / `prop-bed`
- Timing / fish HUD stays off while `busy == sit`
- Smith / booth stay small and grounded (`36×32` / `40×42`)
- `play_sleep.tscn` feeds a night valley snap into `play.tscn`
- `src/sim` / `src/scenes` do not gain `bed-sleep` / `prop-bed` / `char-warm-sit`
- FAIL cover props stay off the valley

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_sleep.tscn`, no server):

```
PLAY_SLEEP_SIT
PLAY_SLEEP_VALLEY
PLAY_SLEEP_OK
```

`npm test`: 116 pass.

## Not this slice

- Kitchen / mine restyle
- Recrop FAIL stickers
- New indoor sleep map

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
