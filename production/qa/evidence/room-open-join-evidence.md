# Evidence — open / join room

*Story: `production/epics/r1-room/story-001-open-join.md`*
*Date: 2026-08-16*
*Type: Integration*
*Slice: verification, not a restyle*

## What already holds

- `room.gd` sits the same `cover-valley.png` behind a `Look.plaque_box()` wood plaque
- `Look.wood_button("开一间")` → `Net.connect_room`
- Join by code (`我有房间码` / `进去`); 暖 / 松 side pick
- No `char-warm` / `char-pine` stickers on the room UI
- No 魂 / Wilson / Wanderer
- `godot/project.test.ts` locks `cover-valley` and forbids `char-warm|char-pine|Wanderer` on the room

## Sign-off

`/story-done` lean. Same dusk/wood as the title. Protocol unchanged.
