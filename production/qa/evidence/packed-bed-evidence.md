# Evidence — packed valley bed

*Story: `production/epics/r1-painted-valley/story-001-packed-bed.md`*
*Date: 2026-08-15*
*Type: Visual/Feel*

## What changed

- Graph: `godot/scenes/play.tscn` → `godot/scenes/valley.tscn` (`ValleyWorld` + `Bed` + `ValleyLogic`)
- Look: `godot/assets/art/bed-valley.png` 1224×612 RGB from the cover. Title cropped at `CROP_Y0 = 302`. Cover pair / 点灯进谷 hard-replaced by a dusk path-and-grass plate (`tools/ref/valley-path-fill.png`) in one landscape corridor. Edges feather only into real path, stream, and hills — not into coats. No person-shaped hole, no 1px column, no Telea smear.
- Play valley: no hung `prop-tuft` / `prop-bush`. Atlas hidden when `_zone == "valley"`.
- Actors: larger under-foot contact shadow. `person_mat` edge 0 so feet are not eaten.
- Torn out: `godot/scripts/valley_map.gd` sticker stamps.

## Where the screenshot dirt came from

| What Brainbird saw | Source | Fix |
|---|---|---|
| Semi-transparent mounds + wrong-scale pillar | `ValleyLogic.show_crops` → hung tuft/bush (earlier); then person-shaped path clone + NS inpaint | Crops still walk plots; no sprites. Bed no longer clones a coat-shaped hole |
| Floating mosaic brown block | `play.gd` `_paint_atlas` on valley tiles | `_atlas.visible = false` when zone is valley |
| Title 「两部 iPhone」 + dirt plate | crop y=218 + resized pair plate | Crop 302; corridor plate, not a resized plate |
| Giant translucent cover pair + stretched brown pillar | Crop kept the poster pair and scaled 418→612; tight ellipses + same-y column fill | One landscape corridor; hard path/grass replace; no column stretch |
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
| Bed is landscape | cover pair / title / CTA not in the play sheet |

## Manual

Enter camera: one dusk painting (hut, path, stream, lodge), live `char-warm` / `char-pine` on the path with a foot stain, wood HUD. No crop mounds, no atlas mosaic, no title calligraphy, no giant cover pair, no brown pillar, no FAIL stickers.

## Sign-off

`/team-polish` lean (director spawn skipped). Visual/Feel evidence. `/story-done` waits on Brainbird's next enter-frame sentence.
