# Evidence — water and wild

*Story: `production/epics/r1-coat-feel/story-022-water-wild.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: 做 on the painted stream / out-gate. Existing beds. Existing fish pull. No rod. No gate sticker. No new face.*

## What this slice covers

- Stand on the stream / dock tile and 做 starts the existing fish pull
- Prompt is a small wood slip: 下竿 / 稳住 · 绿的时候按
- Stand on the valley out-gate tile and 做 enters `bed-wild`
- BODY 240. Camera 2.18. Same idle face

## Replaced

Nothing. No bed. No rod prop. No gate prop. No new person.

## Runtime tokens

Play path (`res://scenes/play_water.tscn`, no server):

```
PLAY_WATER_FISH
PLAY_ENTER_WILD
PLAY_WATER_OK
```

`PLAY_ENTER_OK` still holds.

## Judgment

做 on the dock started the existing pull. 做 on the out-gate sat `bed-wild`. No rod sticker. No gate sticker.

## Not this slice

- New character / title-couple paste
- Recrop FAIL stickers
- Hang `prop-dock` / `prop-gate`
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- Two-iPhone playtest
- 魂 / Wilson / Don't Starve chrome
- Reopen enter-place

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. 做 reaches water and the wild edge. No 魂. `PLAY_WATER_OK`. `PLAY_ENTER_OK` still holds. HTML5 re-exported.
