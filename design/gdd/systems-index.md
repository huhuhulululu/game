# Systems Index: 并肩山谷

> **Status**: Approved (lean — Path D retrofit from WORLD.md)
> **Created**: 2026-08-15
> **Last Updated**: 2026-08-15
> **Source Concept**: `docs/WORLD.md` + `docs/CHARTER.md` (authority). Stub: `design/gdd/game-concept.md`.
> **Review**: lean. TD-SYSTEM-BOUNDARY / PR-SCOPE / CD-SYSTEMS skipped — Lean mode.
> **Do not invent new pillars.** Bones stay CHARTER order.

---

## Overview

One living valley on two iPhones. Authority sim is already Node / WebSocket (`server/` + `src/sim/world.ts`). This index names the systems WORLD already specified, marks what the P0 night already runs, and splits **MVP (rebuild first evening)** from **later** so the Godot client can be torn down and rebuilt as one painted world without designing a second game.

Core loop (first evening): title cover → room code → walk the painted valley → 做 / 喊 → fish or mine → kitchen pot. Pair rules stay world law, not a quest.

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Painted world (look) | Core | MVP | In Design | `godot/docs/ART.md`, `design/art/art-bible.md` | — |
| 2 | Room / net client | Core | MVP | Implemented (P0) | WORLD §两部 iPhone | — |
| 3 | Shared bag / gold / fridge | Economy | MVP | Implemented (P0) | WORLD §世界怎么活 | Room / net |
| 4 | Move / camera | Core | MVP | Implemented (P0) | WORLD §两部 iPhone | Painted world, Room / net |
| 5 | Do / shout | Gameplay | MVP | Implemented (P0) | WORLD 喊 | Move / camera |
| 6 | Two actors (暖 / 松) | Core | MVP | Implemented (P0) | ART + WORLD | Painted world |
| 7 | Fishing | Gameplay | MVP | Implemented (P0) | WORLD 河 + 同钓 | Do / shout, Shared bag |
| 8 | Mine | Gameplay | MVP | Implemented (P0) | WORLD 矿 | Do / shout, Shared bag |
| 9 | Kitchen / pot / rush | Gameplay | MVP | Implemented (P0) | WORLD 厨房 + 堂口 | Shared bag, Do / shout |
| 10 | HUD wood / paper | UI | MVP | Implemented (P0) | ART HUD | Painted world |
| 11 | Workshop / anvil | Gameplay | Vertical Slice | Implemented (P0) | WORLD 工坊 | Shared bag, Do / shout |
| 12 | Stall | Gameplay | Vertical Slice | Implemented (P0) | WORLD 摊位 | Shared bag, Do / shout |
| 13 | Plots (no water) | Gameplay | Vertical Slice | Implemented (P0) | WORLD 田 | Shared bag |
| 14 | Fortune | Gameplay | Vertical Slice | Implemented (P0) | WORLD 卦棚 | Room / net |
| 15 | Dawn board | Gameplay | Vertical Slice | Implemented (P0) | WORLD 黎明看板 | Fortune, Kitchen |
| 16 | Sleep / night turn | Gameplay | Vertical Slice | Implemented (P0) | WORLD 歇一夜 | Room / net, Two actors |
| 17 | Wild / fog / Charlie / fire | Gameplay | Alpha | Implemented (P0) | WORLD 荒野 + 查理 | Painted world, Shared bag |
| 18 | Weather / spoil / icebox | Economy | Alpha | Implemented (P0) | WORLD 天气 + 腐坏 | Shared bag, Kitchen |
| 19 | Campfire cook / sit | Gameplay | Alpha | Implemented (P0) | WORLD 营火 + 火边 | Wild, Shared bag |
| 20 | Pair heat (near / apart) | Gameplay | Vertical Slice | Implemented (P0) | WORLD 两个人的影响 | Two actors, Room / net |
| 21 | Ear (thin SFX) | Audio | Full Vision | Implemented (P0) | play + `ear.gd` | Do / shout |
| 22 | iOS export | Meta | Full Vision | Not Started | CHARTER P3 | Painted world, Room / net |

Inferred only where WORLD implies it (bag UI, camera follow, scene swap). No combat-as-pillar, no sanity, no daily chore spine.

---

## Categories

| Category | Description | This game |
|----------|-------------|-----------|
| **Core** | Look, room, actors, move | Rebuild target |
| **Gameplay** | Places WORLD already named | Keep sim; rebuild only the valley look |
| **Economy** | Shared bag, gold, spoil | Already in sim |
| **UI** | Wood slip / plaque. No 魂 | Keep |
| **Audio** | Five thin sounds + mute | Keep |
| **Meta** | iOS later | P3 |

Removed: XP trees, quest journal, analytics, photo mode. Not in WORLD.

---

## Priority Tiers

| Tier | Definition | This rebuild |
|------|------------|--------------|
| **MVP** | First evening: title, room, one painted valley, two people, move/do/shout, fish/mine/kitchen | Rebuild Godot play structure |
| **Vertical Slice** | Anvil, stall, plots, fortune, board, sleep, pair heat | Already in sim; do not restyle as DST |
| **Alpha** | Wild fog, Charlie, weather, spoil, campfire | Later look passes |
| **Full Vision** | Ear polish, iOS | CHARTER P3 |

---

## Dependency Map

### Foundation Layer (no dependencies)

1. Painted world — one dusk bed is the play floor
2. Room / net client — four-digit code, same snap

### Core Layer

1. Two actors — depend on painted world
2. Move / camera — depend on painted world + net
3. Shared bag / gold — depend on net
4. HUD wood — depend on painted world

### Feature Layer

1. Do / shout — depend on move
2. Fishing, mine, kitchen — depend on do + bag
3. Anvil, stall, plots, fortune, board, sleep, pair heat — depend on do + bag + room
4. Wild / weather / spoil / campfire — depend on painted world + bag

### Presentation Layer

1. Ear — depend on do / fire / shore

### Polish Layer

1. iOS export — depend on HTML5 client + net

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Painted world | MVP | Foundation | technical-artist | S (law exists) |
| 2 | Room / net | MVP | Foundation | network-programmer | S (exists) |
| 3 | Two actors + HUD | MVP | Core | godot-gdscript-specialist | S (exists) |
| 4 | Move / do / shout | MVP | Core | gameplay-programmer | S (exists) |
| 5 | Fish / mine / kitchen | MVP | Feature | gameplay-programmer | S (exists) |
| 6 | Pair + village extras | Vertical Slice | Feature | — | later look |
| 7 | Wild | Alpha | Feature | — | later look |

GDDs are not rewritten per system. WORLD is the GDD. Architecture ADRs cover the rebuild.

---

## Circular Dependencies

- None. Snap is server-owned; client paints. Pair heat reads actor positions from the same snap.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| Painted world | Design | Sticker crops failed three times (dirty a=0 + rect box) | One opaque bed. Do not recrop FAIL PNGs |
| Room / net | Technical | Two phones must share one snap | Keep Node/ws authority. Do not move sim into Godot |
| Wild / Charlie | Scope | DST face must not leak into look | Rules only; no Wilson chrome |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 22 |
| Design docs started | 1 concept stub + WORLD/CHARTER/ART |
| Design docs reviewed | lean skip |
| Design docs approved | Authority docs already approved |
| MVP systems designed | 10/10 (law in WORLD/ART; rebuild is implementation) |
| Vertical Slice systems designed | 8/8 in WORLD |

---

## Next Steps

- [x] Index from WORLD (no new pillars)
- [x] `/create-architecture` + rebuild ADRs
- [ ] `/dev-story` foundation: one painted valley scene graph
- [ ] HTML5 re-export
- Do not `/design-system` a second spine
