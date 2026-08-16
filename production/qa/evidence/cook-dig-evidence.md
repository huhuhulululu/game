# Evidence — cook and dig

*Story: `production/epics/r1-coat-feel/story-023-cook-dig.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: 做 on the painted pot / vein. Existing beds. Existing cook / dig rules. No pot. No pick sticker. No new face.*

## What this slice covers

- Stand on the kitchen pot tile and 做 uses the existing pot
- Prompt is a small wood slip: 入锅
- Stand on the mine vein tile and 做 uses the existing dig
- Prompt is a small wood slip: 挖
- BODY 240. Camera 2.18. Same idle face

## Replaced

Nothing. No bed. No pot prop. No pick prop. No new person.

## Runtime tokens

Play path (`res://scenes/play_cook.tscn`, no server):

```
PLAY_COOK
PLAY_DIG
PLAY_COOK_OK
```

`PLAY_WATER_OK` still holds.

## Judgment

做 on the pot put the hand in the existing pot. 做 on the vein put ore in the hand. No pot sticker. No pick sticker.

## Not this slice

- New character / title-couple paste
- Recrop FAIL stickers
- Hang `prop-pot` / `prop-vein`
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- Two-iPhone playtest
- 魂 / Wilson / Don't Starve chrome
- Reopen water-wild

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. 做 reaches the pot and the vein. No 魂. `PLAY_COOK_OK`. `PLAY_WATER_OK` still holds. HTML5 re-exported.
