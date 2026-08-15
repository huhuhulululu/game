# Art Bible: 并肩山谷

## Document Status
- **Version**: 1.0
- **Last Updated**: 2026-08-15
- **Owned By**: art-director
- **Status**: Draft (lean)
- **Source**: `godot/docs/ART.md` + title cover `godot/assets/art/cover-valley.png`
- **AD-ART-BIBLE**: skipped — Lean mode (2026-08-15)
- **Do not invent a second style.** Short lock stays `godot/docs/ART.md`. Do not overwrite that file.

---

## Visual Identity Summary

One painted warm-dusk cover language. Soft-edge illustration, west sun, olive-gold ground, timber houses with warm windows, two people in everyday coats. The valley, kitchen, mine, wild, and HUD all breathe this air. The cover is the lock. Sticker-cropping trees and houses out of the cover and pasting them back is a failed path.

---

## 1. Visual Identity Statement

**One-line rule:** If it would not sit inside `cover-valley.png` without a second pen, do not put it on screen.

Supporting principles (each is a design test):

1. **One author, one dusk.** When a prop's language is ambiguous, choose the cover's painted dusk — not a Kenney pack, not a pixel-ball tree, not a Don't Starve face.
2. **Form from color and light, not ink.** When an edge is ambiguous, choose a soft painted falloff — not a black outline, not a hard rect crop.
3. **Ground is already dusk.** When the floor looks "too green" or "too cold," paint the olive-gold of the cover. Do not grade a green field with an orange filter (`Look.VALLEY_DUSK = Color(1,1,1)`, `dusk.gdshader` `grade` 0.0).

---

## 2. Color Palette

Sampled from the read-only cover (1280×720 RGB). Roles, not a second skin.

| Name | Approx RGB | Hex | Usage |
| ---- | ---------- | --- | ----- |
| Dusk peach | 208, 154, 134 | `#D09A86` | High sky, title air |
| Ridge gold | 252, 227, 132 | `#FCE384` | Far sun-hit hills |
| Creek bronze | 120, 78, 18 | `#784E12` | Water catching dusk |
| Timber brown | 70, 39, 16 | `#462710` | Hut / lodge wood |
| Coat camel | 74, 45, 22 | `#4A2D16` | 暖 |
| Jacket olive | 28, 29, 18 | `#1C1D12` | 松 |
| Path umber | 17, 14, 9 | `#110E09` | Dirt road in cover space |
| Window ember | warm yellow in wood | — | Interior glow only; not a second sun |

### Semantic color

| Meaning | Color | Backup (not color alone) |
| ------- | ----- | ------------------------ |
| Day valley | Cover dusk, no extra grade | HUD text `白天` |
| Night valley | Warm dim `(0.78, 0.68, 0.52)` | HUD `夜里` |
| Wild, no fire | `(0.46, 0.38, 0.28)` | Dark bite is world, not a 魂 bar |
| Kitchen / mine walls | `(1, 1, 1)` | Place name, not a hue shift |
| Danger | Darkness and fire dying | Sound + world, never a red sanity pip |
| Pair / together | Shared pings, hot pair gear | Text and glow, not a heart meter |

Colorblind: do not encode pair-vs-solo or day-vs-night in hue only. Keep HUD words (`日 · 春 · 白天 · 金`).

---

## 3. Lighting & Atmosphere

| State | Emotion | Light | Atmosphere | Energy |
| ----- | ------- | ----- | ---------- | ------ |
| Title / room | Invitation | Cover dusk, boot splash is the cover | Soft grain (`air.gdshader`), no orange veil | Contemplative |
| Valley day | Walkable dusk | West / left. Highlights on the left. Foot shadows east (`Look.SHADOW_EAST`). No second sun, no top light. | Olive-gold land, one air layer | Measured |
| Valley night | Warm dark | Same west logic, dimmer | Night multiply `(0.78, 0.68, 0.52)` | Quiet |
| Kitchen rush | Hands busy | Neutral walls `(1,1,1)`, stove glow only | No valley grade | Frenetic only here |
| Mine | Lamps on | Neutral walls, no Charlie | Lit floors | Measured |
| Wild night, no fire | Threat | `(0.46, 0.38, 0.28)` | Dark bites; fire is the answer | Tense |
| Wild at fire | Relief | Camp glow, same dusk pen | Sit together, hunger slows | Contemplative |

No orange full-screen grade. One light air grain. `dusk.gdshader` `grade` stays `0.0`.

---

## 4. Character Art Direction

- Two people, same pen as the houses. `Look.BODY = 128` — not 40px sprites.
- **暖**: camel coat, bag. **松**: olive jacket.
- Soft everyday folds. Soft ellipse foot shadow, east, same rule as houses.
- Readable from behind (cover pose) and in walk / fish / chop / forge / sit sheets (`char-warm-*`, `char-pine-*`).
- Distinguishing trait is coat color and silhouette, not a cartoon head or Wilson face.
- LOD: keep painted cloth at game camera (enter zoom ~1.58). Do not swap in pixel dolls.

---

## 5. Environment & Level Art

- **Valley:** people, two cover houses, land, creek. That is the set.
- Houses are the cover hut and lodge only. Feet belong in the painted bed, or painted onto it — not floating sticker boxes.
- **Next valley construction (P1 look):** magenta-key the cover as one sprite, **or** sit `cover-valley.png` as one painted bed. Do **not** keep cutting trees / lamps / shore from the cover and stamping them (`prop-cover-*` failed three times).
- Texture philosophy: painted illustration, linear filter, HD-2D. Not nearest 8-bit. Not PBR.
- Prop density: fewer props beat a second language. No stall, anvil, or pixel-ball trees on the valley play floor.
- Kitchen / mine / wild may use other props, but they must still eat this dusk — do not drop a Kenney pine into the enter frame.
- Environmental story: warm windows, west sun, a path and a creek. No sign that says "go cook tonight."

### Shape language

- Organic painted masses (crowns, hills, timber). No geometric ball-trees.
- UI echoes world wood (`tex-slip`, `tex-plaque`), not a rounded beige form kit.
- Hero shapes: the two people and the two houses. Supporting shapes recede into the bed.

---

## 6. UI Visual Language

- HUD is this world's wood: `tex-slip` / `tex-plaque` from cabin grain + `tex-paper`.
- Copy: `日 0 · 春 · 白天 · 金 20`. No 魂. No 饿 number. No sanity.
- No rounded beige form frames. No second UI skin.
- Title and room show the cover, not a collage of character stickers.
- Touch: left stick, 做 / 喊. One person per phone.
- Typography: existing `godot/fonts/multiply.ttf`. No `SystemFont`.

---

## 7. VFX & Particle Style

- One light full-screen air: fine grain, `shaders/air.gdshader`. No second color grade.
- Fire, shout ping, and pot steam stay small and painted. No comic speed lines. No DST night-hands as a mascot.
- Do not boost leftover low-alpha crop fringe into a visible quad (`dusk.gdshader` smoothstep on dirty alpha is why sticker crops boxed).

---

## 8. Asset Standards

### Engine constraints (Godot 4.4.1, HTML5)

- Art lives in `godot/assets/art/`.
- Cover `cover-valley.png` is read-only, 1280×720 RGB (opaque).
- Linear filter. PNG for painted sheets.
- Power-of-two is **not** required for this 2D illustration set. Do not pad the cover to 2048.
- Do not mass-rename to the CCGS `category_name_variant_size` pattern. Repo names are `char-*`, `prop-*`, `tex-*`, `cover-valley`, `floor-valley`, `ground-valley`.

### Texture tiers

| Category | Max | Format | Notes |
| -------- | --- | ------ | ----- |
| Cover / title | 1280×720 | PNG RGB | Read-only lock |
| Valley bed (next) | Cover size or one magenta-key sheet | PNG | One bed, not a pile of crops |
| Characters | 320×480 | PNG RGBA | Existing sheets |
| HUD wood | 640×80 slip, 360×180 plaque | PNG RGBA | From cabin + paper |
| Zone props | existing | PNG RGBA | Not on the valley floor if they are a second pack |

### Production rule for the valley

- **Pass:** one painted bed, or magenta-key so leftover dusk is a key color, not dirty RGB in a=0.
- **Fail:** rect crops with leftover sky/ground in the RGB channels and opaque edge pixels (visible quads). See `docs/asset-audit.md`.
- This turn does not recrop.

---

## 9. Style Prohibitions

- Don't Starve / 饥荒 face, Wilson head, hard ink, pixel outline as the look
- 魂 / 精神值 / sanity HUD
- PNG sticker crops from the cover (trees, lamps, shore, hut, lodge cut-outs pasted back)
- Pixel-ball trees (`prop-tree`, `prop-tree-gold`, `prop-pine` on the valley)
- Stall or anvil on the valley play floor
- Orange grade filter / second sun / top light
- Wanderer inn, red-roof pixel houses, a second pair of dolls
- Mixing three asset packs in one camera
- Adding look in `src/`

---

## Reference Board

| Reference | Take | Leave |
| --------- | ---- | ----- |
| `cover-valley.png` (ours) | Warm dusk, west light, timber, two backs, olive-gold land | Title calligraphy does not become world HUD |
| 饥荒 / DST | Invisible rules only | Face, ink, night-hands mascot, sanity |
| 星露谷 | A valley with many places | Daily watering, cute pixel crop UI as the world skin |
| 潜水员戴夫 | Catch by day, pot by night | Aquarium chrome, mermaid UI |
| Overcooked | Kitchen rush only | Cartoon kitchens on the wild path |

---

## Accessibility

- Colorblind-safe HUD: words + wood slips, not hue-only bars
- No spirit meter to misread
- Minimum HUD type: existing slip size at 1280×720
- Icon + word for 做 / 喊
