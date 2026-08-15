# Evidence — cover-coat people

*Story: `production/epics/r1-two-players/story-001-cover-coats.md`*
*Date: 2026-08-15*
*Type: Visual/Feel*

## What is on the bed

- Live `ActorView` sheets: `char-warm-*` / `char-pine-*`
- `Look.BODY = 128`, `FOOT = 0.979`, `SHADOW_EAST` contact stain
- Play bed is landscape only; cover pair is not baked into `bed-valley.png`

## Acceptance

| Criterion | Result |
|-----------|--------|
| char-warm / char-pine | `actor_view.gd` `_sheet` |
| BODY 128 / FOOT / SHADOW_EAST | `look.gd` + actor locks |
| No Wilson / DST face | tests + sheets |
| Not baked into the bed | corridor fill; Brainbird enter frame |

## Sign-off

Brainbird 2026-08-15 实机：封面大衣人站在路上，没有巨型封面人。
