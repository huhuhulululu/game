# Evidence — first evening, same snap, three places

*Story: `production/epics/r1-first-evening/story-001-fish-mine-kitchen.md`*
*Date: 2026-08-15*
*Type: Integration*
*Slice: walk + 做 / 钓 on the painted bed; zone swap + fish mark through Play*

## What this slice covers

- Play `_show_zone`s valley / mine / kitchen from snap `zone`
- Play `_paint_fish` moves the HUD mark from `fishMark` (not only a posed `headless_look` shot)
- `play_evening.tscn` feeds snaps into `play.tscn` and prints `PLAY_ZONE_*` / `PLAY_FISH_MARK` / `PLAY_EVENING_OK`
- Live evening loop: `FISH_OK` `COOK_OK` `DAY_REST_NO` `SLEEP_OK` `EVENING_OK`
- Live cover loop through Play: `PLAY_ZONE_VALLEY` `PLAY_FISH_MARK` `FISH_OK` `PLAY_ZONE_MINE` `ORE_OK` `PLAY_ZONE_KITCHEN` `PLATE_OK` `COVER_LOOP_OK`
- `src/sim` / `src/scenes` do not gain `bed-valley` look

## Runtime tokens (2026-08-15)

Play path (`res://scenes/play_evening.tscn`, no server):

```
PLAY_ZONE_VALLEY
PLAY_ZONE_MINE
PLAY_ZONE_KITCHEN
PLAY_FISH_MARK
PLAY_EVENING_OK
```

Evening loop (`headless_evening_loop.gd`, ws `127.0.0.1:5173`):

```
FISH_OK 河鱼
COOK_OK 酥鱼条
DAY_REST_NO
SLEEP_OK
EVENING_OK
```

Cover loop (`cover_loop.tscn` → App → Play):

```
PLAY_ZONE_VALLEY
PLAY_FISH_MARK
FISH_OK 厚实河鱼
PLAY_ZONE_MINE
ORE_OK
PLAY_ZONE_KITCHEN
PLATE_OK
COVER_LOOP_OK
```

## Not this slice

- Kitchen / mine tile restyle
- Wild look
- Recrop FAIL stickers
- Hung props on the valley bed

## Sign-off

`/story-done` lean. QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped. Bed stays one painted language. No 魂. No Don't Starve face.
