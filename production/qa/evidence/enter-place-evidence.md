# Evidence — enter place

*Story: `production/epics/r1-coat-feel/story-021-enter-place.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: 做 at a painted door. Existing beds. No door sticker. No new face.*

## What this slice covers

- Stand on the kitchen / mine tile and 做 enters
- Prompt is a small wood slip: 进厨房 / 进矿
- Existing `bed-kitchen.png` / `bed-mine.png` sit
- BODY 240. Camera 2.18. Same idle face

## Replaced

Nothing. No bed. No door prop. No new person.

## Runtime tokens

Play path (`res://scenes/play_enter.tscn`, no server):

```
PLAY_ENTER_KITCHEN
PLAY_ENTER_MINE
PLAY_ENTER_OK
```

`PLAY_HANDS_OK` still holds.

## Judgment

做 reached the kitchen and the mine. Beds changed. No door sticker.

## Not this slice

- New character / title-couple paste
- Recrop FAIL stickers
- Hang `prop-door-open`
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- Two-iPhone playtest
- 魂 / Wilson / Don't Starve chrome
- Reopen html5-hands

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. 做 reaches a place. No 魂. `PLAY_ENTER_OK`. `PLAY_HANDS_OK` still holds. HTML5 re-exported.
