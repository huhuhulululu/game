# Asset Specs — Level: Valley

> **Source**: `design/art/art-bible.md`, `godot/docs/ART.md`, `docs/asset-audit.md`, `design/gdd/game-concept.md`
> **Art Bible**: design/art/art-bible.md
> **Generated**: 2026-08-15
> **Review**: lean (art-director gate skipped). Technical sizes taken from art-bible §8.
> **Status**: 4 assets specced / 0 approved / 0 in production / 2 reuse-done
> **Do not implement art in the spec turn.** Do not recrop FAIL PNGs.

World lock (read from `valley_map.gd`, not edited): `TILE = 36`, map `34 × 17` → **1224 × 612** px. Viewport 1280×720. Enter camera must still show trees left of the lodge, behind 暖, and on the creek — painted into the bed, not stamped.

---

## Construction (pick one)

### Path A — preferred: one painted bed

One new sheet under the actors. Land, path, creek, hut, lodge, and enter-frame trees are **paint on that sheet**. People are live sprites (`char-warm-*`, `char-pine-*`), not baked into the bed. Title calligraphy stays on the cover, not on the play bed.

### Path B — allowed alternative: magenta-key new props

Only if Path A cannot land houses in the bed. New files only. Key `#FF00FF`. After keying, outside the form is **real `a=0`** (RGB of those pixels `0,0,0`). Soft painted edge, no rect box.

### Forbidden

- Recrop or overwrite: `prop-cover-tree.png`, `prop-cover-tree-b.png`, `prop-cover-lamp.png`, `prop-cover-shore.png`, `prop-cover-verge.png`, `prop-hut.png`, `prop-lodge.png`
- Sit those FAIL sheets again as the look
- Pixel-ball trees, stall, anvil on the valley floor
- Don't Starve face, 魂 / sanity HUD
- Leftover dusk RGB in transparent pixels
- Orange grade (`dusk.gdshader` `grade` ≠ 0)

---

## ASSET-001 — Valley painted bed

| Field | Value |
|-------|-------|
| Category | Environment |
| Dimensions | **1224×612** (world) or **1280×720** (cover-aligned). Do not pad to 2048. |
| Format | PNG, RGB or RGBA. Linear filter. |
| Naming | `bed-valley.png` (new). Lives in `godot/assets/art/`. |
| Texture Res | Art bible §8 valley-bed tier |
| Engine | Godot 4.4.1 Sprite2D, `TEXTURE_FILTER_LINEAR`, `z` under actors. `Look.VALLEY_DUSK = Color(1,1,1)`. |

**Visual Description:**
One painted warm-dusk valley from the same pen as `cover-valley.png`. Olive-gold ground (not a green field). West / left sun. Soft-edge timber hut (left) and lodge (right) with warm windows; feet grow out of the dirt, not floating boxes. A dirt path and a creek with a short wet lip. Enter-frame trees: left of the lodge, behind 暖's spawn, on the creek — painted into the bed. No title text. No baked player figures. No stall, anvil, or ball-trees.

**Art Bible Anchors:**
- §1 One-line rule: must sit inside the cover language
- §2 Olive-gold / timber / creek bronze
- §3 West light, no second sun
- §5 One bed; houses' feet in the paint
- §8 Pass = one painted bed
- §9 No sticker crops, no DST face, no 魂

**Generation Prompt:**
Painterly warm-dusk valley, soft-edge illustration, olive-gold earth, west sunlight from the left, timber hut left and two-story wooden lodge right with ember windows, dirt path and creek, painted trees integrated into the ground (left of lodge, mid path, creek bank), no people, no title lettering, no UI, no pixel art, no hard black outline, no Don't Starve, no Wilson face, no rectangular cutouts. 1224x612 or 1280x720, HD-2D, linear, one continuous painting.

**Negative:** sticker sprite, hard rect crop, mosaic upscale, pixel-ball tree, Kenney pack, orange color-grade overlay, sanity meter, 魂, 饥荒 face, magenta leftover in the bed (bed is not keyed).

**Acceptance (Path A):**
- [ ] No rectangular sticker box in the enter frame
- [ ] No leftover dusk RGB in transparent pixels (bed is opaque paint, or if RGBA then `a=0` ⇒ RGB `0,0,0`)
- [ ] Hut and lodge feet in the bed
- [ ] Enter-frame trees visible without `prop-cover-*`
- [ ] Players are cover-coat sprites (`char-warm` camel, `char-pine` olive), not DST faces
- [ ] HUD unchanged: no 魂, no 饿 number
- [ ] `cover-valley.png` untouched
- [ ] FAIL PNGs not overwritten

**Status:** Needed

---

## ASSET-002 — Magenta-key valley props (Path B only)

| Field | Value |
|-------|-------|
| Category | Environment |
| Dimensions | Native paint size. Do not stretch scraps. Hut/lodge at cover scale (~hut 176×132 sit, lodge 220×168 sit are *display* hints, not crop boxes). |
| Format | PNG RGBA. Key color **`#FF00FF`**. After import, outside form is `a=0` and RGB `0,0,0`. |
| Naming | **New files only:** `prop-key-hut.png`, `prop-key-lodge.png`, `prop-key-tree.png`, `prop-key-tree-b.png` (optional). Do not reuse FAIL names. |
| Texture Res | Art bible §8 — new sheets, not recrops |

**Visual Description:**
Same cover pen as ASSET-001, but each form is a new paint (or a fresh key from a *new* working file — not a recrop of the FAIL PNGs). Magenta `#FF00FF` fills only the true outside. Soft painted silhouette. No dusk sky/ground left in the RGB of transparent pixels. No opaque pixels on a rectangular rim.

**Art Bible Anchors:**
- §5 magenta-key alternative
- §8 Pass = magenta-key so leftover dusk is a key, not dirty `a=0`
- §9 No PNG sticker crops (this is a new key, not a restick)

**Generation Prompt:**
Single painted [hut / lodge / tree] in warm-dusk cover language, west light, soft edge, isolated on flat #FF00FF background, no drop shadow baked as a box, no sky, no hillside leftover, no black outline, no Don't Starve face. PNG.

**Negative:** #D09A86 or dusk orange in the key field, dirty alpha, rect bounding-box fill, recrop of cover-valley.png, Wilson, 魂.

**Acceptance (Path B):**
- [ ] Files are new (`prop-key-*`). FAIL list not overwritten
- [ ] Key is `#FF00FF` only
- [ ] Outside the form: real `a=0`, RGB `(0,0,0)` — **no leftover dusk RGB**
- [ ] No rectangular sticker box / opaque edge rim
- [ ] Same west light and timber as the cover
- [ ] Players still cover-coat people; no 魂; no DST face

**Status:** Needed (alt — only if Path A is not used)

---

## ASSET-003 — Players (reuse)

| Field | Value |
|-------|-------|
| Category | Sprite / 2D Art |
| Dimensions | 320×480 existing |
| Format | PNG RGBA |
| Naming | `char-warm-*.png`, `char-pine-*.png` |

**Visual Description:**
暖 = camel coat and bag. 松 = olive jacket. Soft everyday folds. `Look.BODY = 128`. Same pen as the houses. Not 40px dolls. Not a Don't Starve face.

**Art Bible Anchors:** §4 Character Art Direction; §9 no DST face.

**Generation Prompt:**
(none — reuse existing sheets)

**Acceptance:**
- [ ] Valley uses these sheets, not a new head style
- [ ] No Wilson / 饥荒 face
- [ ] Soft east foot shadow (`Look.SHADOW_EAST`), not a per-prop cartoon blob

**Status:** Done (reuse)

---

## ASSET-004 — Valley HUD (reuse)

| Field | Value |
|-------|-------|
| Category | UI |
| Dimensions | slip 640×80, plaque 360×180 |
| Format | PNG RGBA |
| Naming | `tex-slip.png`, `tex-plaque.png` |

**Visual Description:**
Wood slips from cabin grain + paper. Copy like `日 0 · 春 · 白天 · 金 20`. No 魂. No 精神值. No 饿 number.

**Art Bible Anchors:** §6 UI; §9 no 魂.

**Generation Prompt:**
(none — reuse)

**Acceptance:**
- [ ] No 魂 / sanity / spirit meter
- [ ] No second beige form kit

**Status:** Done (reuse)

---

## Retired (do not produce, do not recrop)

| File | Why |
|------|-----|
| `prop-cover-tree.png` | Audit FAIL — dirty dusk RGB + edge box |
| `prop-cover-tree-b.png` | FAIL |
| `prop-cover-lamp.png` | FAIL |
| `prop-cover-shore.png` | FAIL |
| `prop-cover-verge.png` | FAIL |
| `prop-hut.png` | FAIL |
| `prop-lodge.png` | FAIL |

Leave them on disk. A later implement story may stop *using* them. This spec does not rewrite `valley_map.gd`.

---

## Shared / not this spec

`cover-valley.png` — title/boot lock, read-only.  
`ground-valley.png` / `floor-valley.png` — current underlay; Path A replaces their job with `bed-valley.png`.  
Kitchen / mine / wild props — other zones.

---

## Implement later (not this turn)

1. Paint or sit ASSET-001 (Path A) **or** produce ASSET-002 (Path B).
2. Then change `godot/scripts/valley_map.gd` and the tests that string-lock FAIL names. That is `/dev-story`, not this file.
3. Do not export HTML5 unless a hook requires it.
4. Do not add look in `src/`.
