# 并肩山谷 — Claude Code Game Studios (Path D)

Brownfield install. This is **not** a new game. Do not run `/brainstorm`. Do not scaffold a second Godot project. Do not add a sample game.

## Technology Stack

- **Engine**: Godot 4.4
- **Language**: GDScript
- **Build System**: SCons (engine), Godot Export Templates
- **Asset Pipeline**: Godot Import System + custom resource pipeline
- **Version Control**: Git
- **Export**: HTML5 first (`godot/export/web/`). iOS later from the same project.
- **Pin**: editor 4.4.1. `project.godot` features string stays `"4.3"` because tests lock it. Do not upgrade to 4.5 / 4.6.
- **Art path**: `godot/assets/art/`. Cover `cover-valley.png` is read-only.

## North star (do not violate)

Authority is the existing docs, not a fresh GDD:

- `docs/CHARTER.md` — product: two phones, one valley, no sanity/魂, P0 HTML5 night is done, **P1 is look + two-phone play**, P2 engine is already Godot 4, P3 is App Store
- `docs/WORLD.md` — systems and pair rules (fish/mine/kitchen/wild/anvil/stall/plots/fortune/sleep)
- `godot/docs/ART.md` — one painted dusk cover language

Locks:

1. 饥荒 / DST = invisible rules only. No Don't Starve face.
2. 星露谷 = place variety only.
3. 戴夫 = day catch → night pot.
4. Overcooked = kitchen rush only.
5. **No 精神值 / 魂 / sanity HUD.**
6. Two phones must affect each other.
7. Look: one painted dusk. No orange grade filter. No stall/anvil/pixel-ball trees on the valley play floor. **No PNG sticker crops** (magenta-key or one painted bed — do not keep cutting trees from the cover and pasting them back).

## This repo's layout (not the template default)

| Path | Role |
| --- | --- |
| `godot/` | Playable Godot 4.4 client (title, room, valley). **Do not overwrite.** |
| `godot/export/web/` | Existing HTML5. Do not re-export unless a studio hook requires it. |
| `server/` | Node / WebSocket room. Authority sim. **Do not overwrite.** |
| `src/` | TypeScript **reference only**. Systems already ported here. Do not add look. **Do not overwrite.** |
| `docs/WORLD.md`, `docs/CHARTER.md` | Design authority. **Do not overwrite.** |
| `godot/docs/ART.md` | Art authority. |
| `design/gdd/game-concept.md` | Migration stub from CHARTER + WORLD. Authority stays WORLD / CHARTER. |
| `design/art/art-bible.md` | Full art bible. Short lock remains `godot/docs/ART.md`. |
| `.claude/` | Vendored CCGS (Godot specialist set; Unity/Unreal agents dropped). |
| `.cursor/skills/` | Cursor-readable copy of the same slash-command skills. |
| `production/` | `stage.txt`, `review-mode.txt`. |

## Technical Preferences

@.claude/docs/technical-preferences.md

## Engine Version Reference

@docs/engine-reference/godot/VERSION.md

This repo is pinned to **Godot 4.4.1**. `/setup-engine godot 4.4` is done. Do not treat 4.6 as the project engine.

## Coordination / review

`production/review-mode.txt` is **`lean`**. Brainbird delegated full custody. Do not stop for a director gate on every file. Per-skill director gates are skipped; PHASE-GATEs only. See `.claude/docs/director-gates.md`.

Existing WORLD / CHARTER / ART beat the template collaboration protocol. Do not ask "May I write this file?" for routine Path D work.

## Next studio command

Look rebuild, evening places, pair hands, thin audio, and place ear are Complete. Next: `production/epics/r1-coat-feel/story-004-painted-night.md` — dusk becomes night on the painted bed. Two-phone stays Blocked / human. Do not recrop FAIL PNGs. Do not replace `bed-valley.png`. No 魂.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

@.claude/docs/context-management.md
