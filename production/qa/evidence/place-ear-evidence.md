# Evidence — place ear

*Story: `production/epics/r1-coat-feel/story-003-place-ear.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: kitchen hearth / chop and mine vein*

## What this slice covers

- Kitchen plays a generated hearth loop and a chop tone through `play.tscn`
- Mine plays a generated vein tone at `o`
- Mute stops the ear, not the world
- No wav / ogg pack

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_place.tscn`, no server):

```
PLAY_PLACE_HEARTH
PLAY_PLACE_CHOP
PLAY_PLACE_VEIN
PLAY_PLACE_OK
```

`npm test`: 122 pass.

## Not this slice

- More beeps / sample pack
- Two-iPhone playtest
- Recrop FAIL stickers
- Rewrite `bed-valley.png`

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve chrome.
