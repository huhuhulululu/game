# Evidence — coat walk cycle

*Story: `production/epics/r1-coat-feel/story-006-coat-walk.md`*
*Date: 2026-08-16*
*Type: Visual/Feel*
*Slice: Godot look only. Existing char-warm / char-pine sheets. No new pack.*

## What this slice covers

- Walk is four beats: walk → stand → walk2 → stand
- Front, side, and back use the matching existing sheets
- Contact beats stay planted; passing beats lift a little
- `Look.BODY` stays 192. Quiet HUD stays. Stickers stay off

## Runtime tokens

Play path (`res://scenes/play_walk.tscn`, no server):

```
PLAY_WALK_A
PLAY_WALK_PASS
PLAY_WALK_B
PLAY_WALK_OK
```

## Not this slice

- New character / title-couple paste
- Recrop FAIL stickers
- Replace `bed-valley.png`
- Finish fireside (`story-019`)
- Two-iPhone playtest
- 魂 / Wilson / Don't Starve chrome

## Sign-off

`/dev-story` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. One painted language. No 魂.
