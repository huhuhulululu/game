# Evidence — first evening, bed slice

*Story: `production/epics/r1-first-evening/story-001-fish-mine-kitchen.md`*
*Date: 2026-08-15*
*Type: Integration*
*Slice: walk + 做 / fish on the painted bed*

## What this slice covers

- Play still `_show_zone`s valley vs mine/kitchen from the snap
- `_paint_fish` + actor `char-%s-fish` + fight mark
- Headless look now shoots `look-fish` on `ValleyWorld` (busy fish, fight mark) — no FAIL props, no hung tufts
- `src/sim` / `src/scenes` do not gain `bed-valley` look

## Not this slice

- Runtime `FISH_OK` / `COVER_LOOP_OK` tokens (string-locked; live loop not re-run this turn)
- Kitchen / mine tile restyle

## Sign-off

Slice in progress. Bed stays one painted language.
