# Game Concept: 并肩山谷

*Created: 2026-08-15*
*Status: Approved (migrated — not brainstormed)*
*Authority: `docs/CHARTER.md` + `docs/WORLD.md`. This file is a Path D stub so studio skills have a GDD path. Do not replace those docs. Do not run `/brainstorm`.*

---

## Elevator Pitch

> Two people, two iPhones, one living valley. Fish, mine, cook, plant, ask today's fortune, walk into the wild — no one tells you the night has to climax in the kitchen.

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | Dual-phone evening world (survival bones, place variety, catch-to-pot) |
| **Platform** | HTML5 first (Godot 4.4). iOS App Store later. |
| **Player Count** | Two phones, one room. Solo can finish a night; pair things need both. |
| **Session Length** | One evening |
| **Monetization** | Premium (App Store endpoint). No check-in, no daily watering chore. |
| **Comparable Titles** | DST (invisible rules), Stardew (places), Dave the Diver (catch → pot), Overcooked (kitchen rush only) |

---

## Core Fantasy

Two people in the same valley, each on their own screen. Being near each other changes the world. Being apart also changes it. No sanity meter. Night pressure is dark, fire, and what follows you in the trees.

---

## Unique Hook

Two phones must affect each other: pair fish, pair anvil, pair stall, pass dishes, uncover fortune together, lie down together before the night turns.

---

## Game Pillars

1. DST / 饥荒 = invisible rules only. No Don't Starve face.
2. Stardew = place variety only. No daily watering spine.
3. Dave = day catch → night pot. Not "day is padding."
4. Overcooked = kitchen rush only.
5. No 精神值 / 魂 / sanity HUD.
6. Two phones must affect each other.

---

## Visual Identity Anchor

**One painted warm-dusk language.** The lock is `godot/assets/art/cover-valley.png` (read-only, 1280×720 RGB). Play valley is `bed-valley.png` on `valley.tscn`. Soft-edge illustration. West light. Olive-gold ground, not a green field plus an orange filter. No hard ink. No Don't Starve face. No 魂. No PNG sticker crops.

Full spec: `design/art/art-bible.md`. Short lock: `godot/docs/ART.md`.

---

## Stage (from CHARTER)

| Stage | Now |
| --- | --- |
| P0 HTML5 night | Done |
| P1 look + two-phone play | **Now** |
| P2 engine | Already Godot 4 |
| P3 App Store | Later |

---

## Overview

See `docs/WORLD.md` for places and pair rules. See `docs/CHARTER.md` for what we will not do.
