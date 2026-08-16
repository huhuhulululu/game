# Evidence — title is the cover

*Story: `production/epics/r1-title/story-001-cover-boot.md`*
*Date: 2026-08-16*
*Type: UI*
*Slice: verification, not a restyle*

## What already holds

- `boot.gd` loads one `cover-valley.png` TextureRect, aspect-covered
- Tap / click / touch calls parent `show_room`
- No `char-warm` collage, no FAIL props, no 魂 / Wilson / Wanderer
- `godot/project.test.ts` locks `cover-valley` and forbids `prop-cabin|prop-inn|Wanderer`

## Cover write lock (this close)

- `tools/paint_look.py` reads the locked plate and does not `save(..., "cover-valley.png")`
- Tests lock `Does not write cover-valley` and forbid that save

## Sign-off

`/story-done` lean. Same dusk language as the enter frame. No Don't Starve face.
