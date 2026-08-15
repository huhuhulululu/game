# Adoption Plan

> **Generated**: 2026-08-15
> **Project phase**: Production
> **Engine**: Godot 4.4.1 / GDScript (HTML5 first, iOS later)
> **Template**: Claude Code Game Studios, Path D (brownfield)
> **This is a MIGRATION, not a replacement.**

Work through these steps in order. Check off each item as you complete it.
Do **not** run `/brainstorm`. Do **not** scaffold a second Godot project.
Do **not** overwrite `godot/`, `server/`, `src/`, `docs/WORLD.md`, or `docs/CHARTER.md`.

---

## Audit (this install)

| Signal | Finding |
| --- | --- |
| Title / boot | Godot HTML5 exists. `godot/export/web/index.html` + `index.js`. Boot splash is `cover-valley.png`. |
| Room | Godot client opens a Node / WebSocket room. Authority sim is `server/` + `src/sim/world.ts`. |
| Valley | Playable night: room, valley, fish / mine / kitchen / wild / anvil / stall / plots / fortune / sleep, pair rules. CHARTER **P0 done**. |
| Look | **Open gap.** CHARTER **P1 now** = look polish + two-phone play. Sticker crops from the cover failed three times. Next look path is one painted dusk bed or magenta-key — not restamping cut trees. |
| Systems | Ported. TypeScript in `src/` is **reference only**. Do not add look there. Vite canvas is `/legacy`. |
| Studio stage heuristic | 41 TS files in `src/` plus a playable Godot client → **Production**. Not Concept. Not Systems Design. Not Polish (look is unfinished; Polish is an explicit `/gate-check` only). |
| `design/gdd/` | Missing. Design already lives in WORLD / CHARTER / ART. |
| ADRs / stories / sprint yaml | Missing. Do not invent a second design spine. |
| Engine pin | `/setup-engine godot 4.4` done 2026-08-15. `VERSION.md` is 4.4.1. Do not upgrade to 4.6. |

`production/stage.txt` is `Production` from this audit, not from a fresh `/start`.

---

## Map existing docs → `design/gdd` (migrate, do not replace)

Keep WORLD / CHARTER / ART as authority. When a studio skill asks for a GDD path, **copy structure from these files**. Do not rewrite the game.

| Existing authority | Studio path to create later | What to carry |
| --- | --- | --- |
| `docs/CHARTER.md` | `design/gdd/game-concept.md` + `design/gdd/game-pillars.md` | What it is, two phones, no 魂, stage table (P0 done / P1 now / P2 Godot / P3 App Store), "现在不做" |
| `docs/WORLD.md` | `design/gdd/systems-index.md` + per-system GDDs | Places, pair rules, borrowed algorithms (loot, pot, fish weight, fog of war, spoil, kitchen rush) |
| `godot/docs/ART.md` | `design/art/art-bible.md` | One painted dusk cover language. Soft edge. West light. No hard ink. No DST face. |

### Art bible source (for `/art-bible`)

Use **current** `godot/docs/ART.md` as the visual identity, with this correction:

- **Keep**: warm dusk, olive-gold ground (not green field + orange filter), west light, no hard ink, `Look.VALLEY_DUSK = Color(1,1,1)`, `dusk.gdshader` `grade` 0.0, HUD with no 魂, 暖 camel coat / 松 olive jacket, cover hut + lodge as the only houses.
- **Do not treat as the future look**: the paragraph that says to keep cutting trees / lamps / shore from the cover and stamping them on the play floor. Sticker crops failed. Next path is **magenta-key or one painted bed**.

Prohibitions to write into the art bible:

- No Don't Starve face
- No 魂 / sanity meter
- No PNG sticker crops
- No stall / anvil / pixel-ball trees on the valley play floor

If `/art-bible` refuses because `design/gdd/game-concept.md` is missing, **write that file as a migration of CHARTER + WORLD first**. Still do not run `/brainstorm`.

### Asset audit target

Studio default is `assets/art/**`. This repo's art is `godot/assets/art/`. Run `/asset-audit` against that folder. Cover `cover-valley.png` is read-only 1280×720 RGB.

---

## First three slash commands (next run)

Execute in this order. Review mode is already `lean`.

1. **`/setup-engine godot 4.4`**
   - Engine and GDScript are already pinned. Refresh `docs/engine-reference/godot/` from the 4.6 snapshot to **4.4**.
   - Do not change language. Do not offer Unity / Unreal. Do not create a new Godot project.
   - Time: 30 min
   - [x] Engine reference matches Godot 4.4

2. **`/art-bible`**
   - Source: `godot/docs/ART.md` + the correction above.
   - One painted dusk cover language. No DST face. No 魂. No PNG sticker crops.
   - Time: 1 session
   - [x] `design/art/art-bible.md` exists and does not contradict CHARTER / ART locks

3. **`/asset-audit`** on `godot/assets/art`
   - Naming in this repo is `char-*`, `prop-*`, `tex-*`, `cover-valley`, `floor-valley`, `ground-valley` — do not mass-rename to the template `category_name_variant_size` pattern; report drift only.
   - Time: 30 min
   - [x] Audit written (`docs/asset-audit.md`); cover left read-only; sticker crops marked FAIL; not recropped

---

## Step 1: Blocking gaps

None that break the playable night. Engine is pinned in this install. Stage and review mode are written.

- [x] `production/stage.txt` = `Production`
- [x] `production/review-mode.txt` = `lean`
- [x] `.claude/docs/technical-preferences.md` pinned (Godot 4.4, GDScript, HTML5 first)

---

## Step 2: High-priority gaps

### 2a. No studio GDD tree

Problem: CCGS skills look for `design/gdd/game-concept.md` and `design/gdd/systems-index.md`. Those files are absent; the design already exists in WORLD / CHARTER.

Fix: migrate (table above). Do not replace WORLD / CHARTER.

Time: 1 session (after the three commands, or as a prerequisite write if `/art-bible` blocks)

- [x] `design/gdd/game-concept.md` migrated from CHARTER + WORLD
- [ ] `design/gdd/systems-index.md` migrated from WORLD (no parenthetical status values)

### 2b. Engine reference version drift

Problem: vendored VERSION.md says Godot 4.6. This project is 4.4.1.

Fix: `/setup-engine godot 4.4`

- [x] VERSION.md pins 4.4.1

### 2c. Asset path drift

Problem: `/asset-audit` defaults to `assets/art/`.

Fix: pass `godot/assets/art`.

- [x] Audit run on the Godot art folder (`docs/asset-audit.md`)

---

## Step 3: Bootstrap infrastructure (later, not before look)

Do not let studio bootstrap block P1 look work.

### 3a. Requirements registry

`/architecture-review` after GDDs exist.

- [ ] `docs/architecture/tr-registry.yaml`

### 3b. Control manifest

`/create-control-manifest`

- [ ] `docs/architecture/control-manifest.md`

### 3c. Sprint file

`/sprint-plan update` only if Brainbird wants studio sprint tracking. CHARTER stages (P0–P3) already exist.

- [ ] `production/sprint-status.yaml` (optional)

### 3d. Stage file

Already written from the audit. Do not `/gate-check` backward to Concept.

- [x] `production/stage.txt` = `Production`

---

## Step 4: Medium-priority gaps

- GDD 8-section headings (Overview, Player Fantasy, Detailed Rules, Formulas, Edge Cases, Dependencies, Tuning, Acceptance) are absent because design is in WORLD. When migrating, add those headings **around existing rules**, do not invent new systems.
- No ADRs. Optional later: one ADR that records "Godot 4.4 HTML5 client + Node/WS authority + TS reference-only".
- `/asset-audit` naming pattern will flag `char-warm.png` etc. That is expected. Do not rename playable art to satisfy the template.

---

## Step 5: Optional improvements

- Existing stories: none. Do not generate a backlog that restarts the game.
- Unity / Unreal agents were dropped on purpose. Do not restore them.
- Do not export a new HTML5 unless a studio hook requires it.

---

## What not to do

- Do not treat this repo as a fresh CCGS game.
- Do not copy studio `src/` or a sample design.
- Do not add look in `src/`.
- Do not stop for a director gate on every file (`lean`).
- Do not keep cutting PNG stickers from the cover.

---

## Re-run

The three commands are done. Next studio command: **`/asset-spec`** for the valley (one painted dusk bed or magenta-key). Do not recrop sticker PNGs. Do not `/brainstorm`. A dated `/adopt` report may be added later; this file stays the Path D map.
