# Asset Audit Report -- Art -- 2026-08-15

2026-08-16 addendum: new beds and magenta props (`bed-kitchen`, `bed-mine`, `bed-wild`, `prop-smith`, `prop-booth`, kitchen stations) **PASS**. Valley bed still clean. FAIL cover stickers below stay FAIL — do not recrop. Full table: `production/qa/evidence/beds-props-audit.md`.

Target: `godot/assets/art` (not the template `assets/art/`).
Standards: `design/art/art-bible.md`, `godot/docs/ART.md`, `CLAUDE.md`.
Review: lean. Read-only this turn — **do not recrop**.

## Summary
- **Total assets scanned**: 77 PNG
- **Naming violations**: 77 vs CCGS `category_name_variant_size` (expected drift — do not mass-rename)
- **Size violations**: 0 vs project budgets (cover lock is 1280×720)
- **Format violations**: 7 **FAIL** sticker / dirty-alpha cover crops + mixed-pack risk on valley
- **Orphaned assets**: 1 likely (`prop-verge.png`); several mixed-pack props unused on the valley (keep for other zones)
- **Missing assets**: 0 (referenced names exist)
- **Overall health**: **NEEDS ATTENTION**

## FAIL — sticker / dirty-alpha cover crops

Do not recrop in this turn. Next look path is magenta-key or one painted valley bed.

Every transparent pixel on these sheets still carries leftover cover dusk RGB (`a=0` but `RGB ≠ 0`). Several also have opaque pixels on the image edge (visible quad / box).

| File | Size | Dirty RGB at a=0 | Opaque edge px | Leftover sample | Verdict |
|------|------|------------------|----------------|-----------------|---------|
| `prop-cover-tree.png` | 139×235 | 22044 / 22044 transparent | 256 | `(233,139,80,0)` dusk | **FAIL** |
| `prop-cover-tree-b.png` | 139×175 | 14258 / 14258 | 154 | `(168,98,32,0)` | **FAIL** |
| `prop-cover-lamp.png` | 27×51 | 294 / 294 | 115 | `(49,37,25,0)` | **FAIL** (tiny + boxed) |
| `prop-cover-shore.png` | 140×65 | 4674 / 4674 | 348 | `(154,115,55,0)` | **FAIL** |
| `prop-cover-verge.png` | 135×57 | 3109 / 3109 | 346 | `(171,106,16,0)` | **FAIL** |
| `prop-hut.png` | 157×155 | 7616 / 7616 | 125 | `(200,126,48,0)` | **FAIL** |
| `prop-lodge.png` | 241×261 | 14858 / 14858 | 277 | `(230,158,116,0)` | **FAIL** |

These files stay on disk. The play valley no longer sits them. Do not recrop.

`cover-valley.png` itself is **PASS** as the lock: 1280×720 RGB, opaque, read-only.

## Naming Violations

Repo convention (keep): `char-*`, `prop-*`, `tex-*`, `cover-valley`, `floor-valley`, `ground-valley`.

CCGS template pattern: `[category]_[name]_[variant]_[size].[ext]`.

| File | Expected Pattern | Issue |
|------|-----------------|-------|
| All 77 PNG | template `category_name_variant_size` | Hyphenated short names. **Report only. Do not rename.** |

Characters are consistent: `char-{warm\|pine}-{pose}`. That is the project standard.

## Size Violations

| File | Budget | Actual | Overage |
|------|--------|--------|---------|
| — | — | — | None vs the cover lock and HTML5 2D budgets |

Not power-of-two (cover 1280×720, characters 320×480, most props odd). Allowed for this painted 2D set. Do not pad.

## Format Violations

| File | Expected Format | Actual Format |
|------|----------------|---------------|
| Cover-crop props above | Magenta-key or one painted bed; clean key, no leftover dusk in a=0 | RGB leftover in every transparent pixel + opaque rims |
| `cover-valley.png` | RGB lock | RGB 1280×720 — **correct** |
| `ground-valley.png` | RGB or one bed | 1224×612 RGB — pad under the floor; not a crop fail |
| `floor-valley.png` | Painted dusk sheet | 1320×708 RGBA, no a=0 (amin=5) — fringe, not a sticker crop |

## Mixed packs (second language)

ART lock: no `prop-pine`, `prop-tree-gold`, pixel-ball trees, stall, or anvil **on the valley play floor**.

| File | Valley? | Notes |
|------|---------|-------|
| `prop-tree.png` | No (used in `zone_map.gd` wild) | Second crown language. Keep off the enter valley. |
| `prop-tree-gold.png` / `prop-tree-tall.png` / `prop-tree-wide.png` / `prop-pine.png` / `prop-pine-snow.png` | Not in `valley_world.gd` | Mixed pack. Do not stamp on valley. |
| `prop-stall.png` / `prop-anvil.png` | Forbidden on valley (tests lock this) | OK as workshop / stall props elsewhere |
| `char-warm-*` / `char-pine-*` | Used | Same pen as cover people — **PASS** |
| `tex-slip.png` / `tex-plaque.png` | HUD | Wood language — **PASS** |

## Orphaned Assets (no code references found)

| File | Last Modified | Size | Recommendation |
|------|-------------|------|---------------|
| `prop-verge.png` | tracked | 409999 | Review later. Do not delete this turn. Shore/verge on valley use `prop-cover-verge.png` (FAIL crop). |

Other unused mixed-pack trees are reserved for wild / kitchen, not orphans.

## Missing Assets (referenced but not found)

| Reference Location | Expected Path |
|-------------------|---------------|
| — | None. `valley_world.gd` / `look.gd` / `boot.gd` / `room.gd` names exist on disk. |

## Recommendations

1. **Do not recrop** `prop-cover-*`, `prop-hut`, `prop-lodge` again.
2. Play valley is `valley.tscn` + `bed-valley.png`. Do not recrop FAIL files.
3. Keep cover read-only.
4. Do not mass-rename to the template pattern.
5. Keep stall / anvil / pixel-ball trees off `valley_world.gd`.

## Verdict: NON-COMPLIANT

Playable night exists. Look is blocked by sticker / dirty-alpha cover crops and leftover RGB quads. Characters, cover, and HUD wood are the passing set.
