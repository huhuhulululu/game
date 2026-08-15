# Evidence — packed valley bed

*Story: `production/epics/r1-painted-valley/story-001-packed-bed.md`*
*Date: 2026-08-15*
*Type: Visual/Feel*

## What changed

- New graph: `godot/scenes/play.tscn` → `godot/scenes/valley.tscn` (`ValleyWorld` + `Bed` + `ValleyLogic`)
- Look: `godot/assets/art/bed-valley.png` 1224×612 RGB, derived from the cover, title cropped, baked people hard-filled
- Torn out: `godot/scripts/valley_map.gd` sticker stamps (`_houses`, `_ridge`, `_shore`, `_bits`, `_land`)

## Acceptance

| Criterion | Result |
|-----------|--------|
| Packed scenes | `play.tscn`, `valley.tscn` |
| One bed | `bed-valley.png` RGB, no alpha leftover |
| FAIL props unused | not referenced by valley/play scripts |
| FAIL files on disk | hashes unchanged |
| Cover read-only | hash `64663412fa85294e` |
| No 魂 / DST face | play scripts unchanged |
| Crops / ROWS | `valley_logic.gd` |

## Manual

Enter camera should show hut + path + painted trees, live `char-warm` / `char-pine`, wood HUD `日 0 · 春 · 白天 · 金 20`. No sticker quads.

## Sign-off

Lean rebuild. Visual polish is `/team-polish`.
