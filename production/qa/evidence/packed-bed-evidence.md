# Evidence — packed valley bed

*Story: `production/epics/r1-painted-valley/story-001-packed-bed.md`*
*Date: 2026-08-15*
*Type: Visual/Feel*

## What changed

- Graph: `godot/scenes/play.tscn` → `godot/scenes/valley.tscn` (`ValleyWorld` + `Bed` + `ValleyLogic`)
- Look: `godot/assets/art/bed-valley.png` 1224×612 RGB from the cover. Title cropped at `CROP_Y0 = 302`. Baked 暖/松 / 点灯进谷 lifted with same-y path seed + NS inpaint (no resized dirt plate, no Telea).
- Play valley: no hung `prop-tuft` / `prop-bush`. Atlas hidden when `_zone == "valley"`.
- Actors: larger under-foot contact shadow. `person_mat` edge 0 so feet are not eaten.
- Torn out: `godot/scripts/valley_map.gd` sticker stamps.

## Where the screenshot dirt came from

| What Brainbird saw | Source | Fix |
|---|---|---|
| Semi-transparent mounds + wrong-scale pillar | `ValleyLogic.show_crops` → `Look.hung(prop-tuft/prop-bush)` + dusk edge + contact ellipses | `show_crops` still walks plots; does not add sprites |
| Floating mosaic brown block | `play.gd` `_paint_atlas` on valley tiles (34×17, cell 4) | `_atlas.visible = false` when zone is valley |
| Title 「两部 iPhone」 + dirt plate | `paint_valley_bed.py` crop y=218 + resized pair plate | Crop 302; 1:1 path clone |
| Feet not in the path | Small east-only `Look.contact(BODY * 0.45)` | Wider stain under the feet; shader edge 0 |

FAIL `prop-cover-*` / `prop-hut` / `prop-lodge` were not put back.

## Acceptance

| Criterion | Result |
|-----------|--------|
| Packed scenes | `play.tscn`, `valley.tscn` |
| One bed | `bed-valley.png` RGB 1224×612, no alpha leftover |
| FAIL props unused | not referenced by valley/play scripts |
| FAIL files on disk | hashes unchanged |
| Cover read-only | hash `64663412fa85294e` |
| No 魂 / DST face | play scripts unchanged |
| Crops / ROWS | `show_crops` + `prop-tuft` / `prop-bush` names; no `Look.hung` |
| Valley atlas | hidden |
| Contact shadow | `ActorView` uses `Look.contact` + `SHADOW_EAST` under the feet |

## Manual

Enter camera: one dusk painting, live `char-warm` / `char-pine` on the path with a foot stain, wood HUD. No crop mounds, no atlas mosaic, no title calligraphy, no FAIL stickers.

## Sign-off

`/team-polish` lean (director spawn skipped). Visual/Feel evidence for `/story-done`.
