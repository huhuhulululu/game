# Evidence — sleep and sit

*Story: `production/epics/r1-coat-feel/story-024-sleep-sit.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: 做 on the painted bed. Existing sit sheet. Existing sleep / sit rules. No bed. No fire sticker. No new face.*

## What this slice covers

- Stand on the house / bed tile and 做 uses the existing sleep
- Prompt is a small wood slip: 歇一夜
- Night still near the painted hearth uses the existing sit pose
- Existing toast: 火边坐了一会儿
- BODY 240. Camera 2.18. Same idle face

## Replaced

Nothing. No bed. No fire prop. No new person.

## Runtime tokens

Play path (`res://scenes/play_rest.tscn`, no server):

```
PLAY_SLEEP
PLAY_SIT
PLAY_REST_OK
```

`PLAY_COOK_OK` still holds. `PLAY_WATER_OK` still holds.

## Judgment

做 on the house tile slept. The wood slip said 歇一夜. Night at the hearth used the existing sit sheet and the existing fireside toast. No bed sticker. No fire sticker.

## Not this slice

- New character / title-couple paste
- Recrop FAIL stickers
- Hang `prop-bed` / `prop-fire` / `prop-hearth` / `prop-camp-pot`
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- Two-iPhone playtest
- 魂 / Wilson / Don't Starve chrome
- Reopen cook-dig

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. 做 reaches the house tile. Sit uses the existing pose. No 魂. `PLAY_REST_OK`. `PLAY_COOK_OK` still holds. HTML5 re-exported.
