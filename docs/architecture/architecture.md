# 并肩山谷 — Master Architecture

## Document Status
- Version: 1.0
- Last Updated: 2026-08-15
- Engine: Godot 4.4.1 / GDScript (HTML5 first)
- GDDs Covered: `docs/WORLD.md`, `docs/CHARTER.md`, `design/gdd/game-concept.md`, `design/gdd/systems-index.md`, `design/art/art-bible.md`
- ADRs Referenced: ADR-0001 scene graph, ADR-0002 net client, ADR-0003 painted world
- Technical Director Sign-Off: 2026-08-15 — APPROVED WITH CONDITIONS (lean self-review; LP-FEASIBILITY skipped — Lean mode)
- Lead Programmer Feasibility: skipped — Lean mode
- Retrofit: does **not** replace CHARTER. P0 night stays. P1 is look + two-phone play.

## Engine Knowledge Gap Summary

Engine 4.4.1 is MEDIUM risk (training ~4.3). Verify FileAccess `store_*` bool, shader `Texture` params. Do not apply 4.5/4.6 defaults. This rebuild is 2D CanvasItem + packed scenes — no Jolt, no D3D12.

HIGH RISK domains: none in this 2D HTML5 client.
MEDIUM RISK: Rendering (linear filter, GL Compatibility), Scripting (4.4 GDScript).
LOW RISK: 2D Sprite2D, Camera2D, CanvasLayer, WebSocket client as already shipped.

## System Layer Map

```
┌─────────────────────────────────────────────┐
│  PRESENTATION                               │  HUD wood slips, 做/喊, ear, air grain
├─────────────────────────────────────────────┤
│  FEATURE                                    │  fish / mine / kitchen / (later wild…)
├─────────────────────────────────────────────┤
│  CORE                                       │  ValleyWorld + actors + move/do/shout
├─────────────────────────────────────────────┤
│  FOUNDATION                                 │  App scene swap, Net autoload, painted bed
├─────────────────────────────────────────────┤
│  PLATFORM                                   │  Godot 4.4.1 HTML5 · Node/ws authority
└─────────────────────────────────────────────┘
```

| System | Layer | Owns |
|--------|-------|------|
| Painted world | Foundation | `bed-valley.png`, `ValleyWorld` scene |
| Room / net | Foundation | `Net` autoload, room code, snap |
| Two actors | Core | `ActorView` char-warm / char-pine |
| Move / do / shout | Core | input → `Net.send_input` |
| Shared bag | Core | snap `bag` / gold (server) |
| Fish / mine / kitchen | Feature | zone maps + prompts (server rules) |
| HUD | Presentation | plaque / slip, no 魂 |
| Ear | Presentation | five sounds, mute does not send |

## Module Ownership

### Foundation — App

- **Owns**: boot / room / play swap
- **Exposes**: `show_boot`, `show_room`, `show_play`
- **Consumes**: packed scenes
- **Engine APIs**: `Control`, `PackedScene.instantiate` (4.4, LOW)

### Foundation — Net

- **Owns**: WebSocket, join, last snap
- **Exposes**: `snap_got`, `joined`, `fail`, `send_input`, `send_take`
- **Consumes**: room server
- **Engine APIs**: existing `net.gd` (do not rewrite protocol)

### Foundation — ValleyWorld

- **Owns**: one bed sprite + logic grid (ROWS, crops)
- **Exposes**: `size_px()`, `show_crops()`
- **Consumes**: `bed-valley.png`
- **Forbidden**: FAIL cover props, stall/anvil/pine on the valley floor

### Core — Play

- **Owns**: camera, actors, zone swap, HUD
- **Exposes**: none (leaf client)
- **Consumes**: snap, ValleyWorld, ZoneMap, ActorView, Look

## Data Flow

1. **Frame**: pad/keys → `Net.send_input` → server tick → `snap_got` → Play paints actors / HUD / zone
2. **Events**: Godot signals on Net only. No second event bus.
3. **Save**: room lives ten minutes on the server. No Godot save.
4. **Init**: `main.tscn` App → boot (cover) → room → `play.tscn` → `valley.tscn`

```
iPhone A ──ws──► Node room ──snap──► Godot Play
iPhone B ──ws──┘         ▲
                         └── src/sim/world.ts (reference + server)
```

## API Boundaries

```
# ValleyWorld
func size_px() -> Vector2
func show_crops(plots: Array) -> void
# Bed is a child Sprite2D. Logic is a child ValleyLogic.
# Callers must not stamp prop-cover-* / prop-hut / prop-lodge.

# Net (existing)
signal snap_got(snap: Dictionary)
func send_input(x, y, act, held, ping) -> void
```

Invariants: `Look.VALLEY_DUSK = Color(1,1,1)`. `dusk.gdshader` `grade` 0.0. HUD copy like `日 0 · 春 · 白天 · 金 20`. No 魂.

## ADR Audit

| ADR | Engine Compat | Version | GDD Linkage | Conflicts | Valid |
|-----|--------------|---------|-------------|-----------|-------|
| ADR-0001 scene graph | ✅ | 4.4.1 | WORLD places + ART bed | Overturns sticker `valley_map` | ✅ |
| ADR-0002 net client | ✅ | 4.4.1 | WORLD two phones | None — retrofit | ✅ |
| ADR-0003 painted world | ✅ | 4.4.1 | ART / art-bible | Overturns FAIL crops | ✅ |

## Required ADRs

Written this rebuild (Foundation):
- ADR-0001 Godot scene graph
- ADR-0002 Net client stays Node/ws
- ADR-0003 One painted world

Can defer: kitchen/mine zone look, wild look, iOS export.

## Architecture Principles

1. **CHARTER is product law.** Do not brainstorm a new game.
2. **Server owns the night.** Godot paints. TypeScript `src/` is reference only.
3. **One painted dusk.** The valley is a bed, not a collage.
4. **Two phones must affect each other.** Pair rules stay in the sim.
5. **No 魂. No DST face.** Hunger is sim-only.

## Open Questions

| ID | Summary | Priority | Resolution Path |
|----|---------|----------|-----------------|
| QQ-01 | Kitchen/mine still use zone tiles | Medium | Later look story — not this rebuild |
| QQ-02 | Cover people baked on title | Low | Title keeps cover; play bed lifts them |
