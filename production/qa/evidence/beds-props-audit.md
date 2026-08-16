# Asset Audit Report -- New beds and magenta props -- 2026-08-16

Target: new Path A beds + magenta-key props named in this pass.
Standards: `design/art/art-bible.md` §8–9, `godot/docs/ART.md`, `docs/asset-audit.md` (FAIL stickers).
Review: lean. Fail leftover dusk RGB in `a=0` pixels, or opaque pixels on a prop's image edge (visible quad).

Do not recrop `prop-cover-*` / `prop-hut` / `prop-lodge`. Do not touch `bed-valley.png` unless it fails.

## Summary
- **Total assets scanned**: 14 in-scope + 1 valley-bed control + 7 known FAIL (not recropped)
- **Leftover dusk RGB (`a=0` and RGB ≠ 0)**: 0 in-scope
- **Rectangular boxes (opaque prop edge)**: 0 in-scope
- **Valley bed broke?**: No
- **Overall health**: **CLEAN** (in-scope). Known FAIL stickers stay FAIL on disk.

## Beds (Path A — opaque RGB is pass)

Opaque edges on a painted bed are the floor sheet, not a sticker box.

| File | Mode | Size | Dirty RGB at a=0 | Opaque edge | Verdict |
|------|------|------|------------------|-------------|---------|
| `bed-kitchen.png` | RGB | 576×324 | 0 | expected (opaque sheet) | **PASS** |
| `bed-mine.png` | RGB | 576×324 | 0 | expected (opaque sheet) | **PASS** |
| `bed-wild.png` | RGB | 864×576 | 0 | expected (opaque sheet) | **PASS** |
| `bed-valley.png` (control) | RGB | 1224×612 | 0 | expected (opaque sheet) | **PASS** — do not touch |

## Magenta props (real `a=0`, RGB 0,0,0; no edge box)

| File | Size | Trans px | Dirty RGB at a=0 | Magenta sit | Opaque edge px | Verdict |
|------|------|----------|------------------|-------------|----------------|---------|
| `prop-smith.png` | 240×200 | 36497 | 0 | 0 | 0 | **PASS** |
| `prop-booth.png` | 280×300 | 50565 | 0 | 0 | 0 | **PASS** |
| `prop-hearth.png` | 260×260 | 53416 | 0 | 0 | 0 | **PASS** |
| `prop-chop.png` | 220×180 | 25582 | 0 | 0 | 0 | **PASS** |
| `prop-oven.png` | 220×240 | 32262 | 0 | 0 | 0 | **PASS** |
| `prop-serve.png` | 240×240 | 43634 | 0 | 0 | 0 | **PASS** |
| `prop-cool.png` | 200×240 | 28658 | 0 | 0 | 0 | **PASS** |
| `prop-bin.png` | 160×160 | 19071 | 0 | 0 | 0 | **PASS** |
| `prop-shelf.png` | 200×240 | 27153 | 0 | 0 | 0 | **PASS** |
| `prop-way.png` | 220×260 | 41270 | 0 | 0 | 0 | **PASS** |

## Known FAIL (leave on disk, do not recrop)

Same dirty-alpha cover crops as `docs/asset-audit.md`. Every transparent pixel still carries leftover dusk RGB. Several still have opaque rims.

| File | Dirty RGB at a=0 | Opaque edge px | Sample | Verdict |
|------|------------------|----------------|--------|---------|
| `prop-cover-tree.png` | 22044 / 22044 | 218 | `(233,139,80,0)` | **FAIL** — do not recrop |
| `prop-cover-tree-b.png` | 14258 / 14258 | 130 | `(168,98,32,0)` | **FAIL** — do not recrop |
| `prop-cover-lamp.png` | 294 / 294 | 47 | `(49,37,25,0)` | **FAIL** — do not recrop |
| `prop-cover-shore.png` | 4674 / 4674 | 153 | `(154,115,55,0)` | **FAIL** — do not recrop |
| `prop-cover-verge.png` | 3109 / 3109 | 161 | `(171,106,16,0)` | **FAIL** — do not recrop |
| `prop-hut.png` | 7616 / 7616 | 25 | `(200,126,48,0)` | **FAIL** — do not recrop |
| `prop-lodge.png` | 14858 / 14858 | 146 | `(230,158,116,0)` | **FAIL** — do not recrop |

Play does not sit these. `/team-polish` does not touch them.

## Polish

No in-scope fails. `/team-polish` is a no-op this pass.

## Verdict: COMPLIANT (in-scope)

New beds are opaque dusk sheets. New magenta props have real `a=0` and no edge quads. Valley bed did not break. FAIL stickers remain FAIL and stay uncropped.
