# Evidence — quiet chrome

*Story: `production/epics/r1-coat-feel/story-007-quiet-chrome.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: Godot look + HTML5 shell only. No new WORLD system. No new props. No recrop.*

## What this slice covers

- HTML load overlay no longer prints DOM title/subtitle over the canvas
- Boot splash is the painted cover at full size
- Empty toast / order stacks stay hidden; no reserved top-right box
- 做 does not flash leftover geom
- Real toast ink still shows, then hides when the snap is empty

## Runtime tokens

Play path (`res://scenes/play_chrome.tscn`, no server):

```
PLAY_CHROME_EMPTY
PLAY_CHROME_DO
PLAY_CHROME_OK
```

## Not this slice

- New character / title-couple paste
- Recrop FAIL stickers
- Replace `bed-valley.png`
- Finish fireside (`story-019`)
- Two-iPhone playtest
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another WORLD system

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No DOM title bleed. No empty toast box. No 魂. `npm test`: 142 pass. `PLAY_CHROME_OK`. HTML5 re-exported.
