# Evidence — coat walk and sit-to-stand

*Story: `production/epics/r1-coat-feel/story-001-walk-sit.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: local stride + sit ease on existing cover-coat sheets*

## What this slice covers

- Walk uses a local `_stride` on `char-*-walk` / `walk2` (not wall-clock flicker)
- Sit and stand ease on existing sit / stand sheets
- `Look.FOOT` stays `0.979`
- No new character pack; Wilson raws stay banned
- `play_coats.tscn` feeds idle → move → sit → stand into `play.tscn`

## Runtime tokens (2026-08-16)

Play path (`res://scenes/play_coats.tscn`, no server):

```
PLAY_COAT_WALK
PLAY_COAT_SIT
PLAY_COAT_OK
```

`npm test`: 118 pass.

## Not this slice

- New character pack
- Onboarding lecture
- Two-iPhone playtest
- Recrop FAIL stickers

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂. No Don't Starve face.
