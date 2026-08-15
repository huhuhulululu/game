# ADR-0001: Godot scene graph — painted world, not sticker map

## Status

Accepted

## Date

2026-08-15

## Last Verified

2026-08-15

## Decision Makers

Brainbird (custody). Lean Path D rebuild.

## Summary

The play valley is a packed scene (`valley.tscn`) with one bed sprite and a logic grid. Play is a packed scene (`play.tscn`). The old `ValleyMap` that stamped FAIL cover crops is torn out.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Godot 4.4.1 |
| **Domain** | Core / Rendering |
| **Knowledge Risk** | LOW — Sprite2D, PackedScene, Camera2D are in training data |
| **References Consulted** | `docs/engine-reference/godot/VERSION.md` |
| **Post-Cutoff APIs Used** | None |
| **Verification Required** | HTML5 export still opens play; `npm test` look locks |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None |
| **Enables** | ADR-0003 |
| **Blocks** | Foundation painted-valley story |
| **Ordering Note** | Implement with ADR-0003 in the same rebuild |

## Context

### Problem Statement

`valley_map.gd` mixed a logic grid with ground/floor sheets and seven FAIL sticker props. Patching textures on that graph keeps the failed vertical slice.

### Current State

Play is constructed in `play.gd` via `ValleyMap.new()`. No `play.tscn`. Stickers sit on the enter frame.

### Constraints

- Keep ROWS / crops / zone swap / Net snap
- Do not recrop FAIL PNGs
- Do not start a second Godot project
- HTML5 first

### Requirements

- First look is one painted world
- Logic grid is not the look
- Headless loops still instance a valley and call `show_crops`

## Decision

```
App (main.tscn)
  boot.gd          cover-valley.png
  room.gd          cover + wood plaque
  play.tscn        Play (play.gd)
    World
      valley.tscn  ValleyWorld
        Bed        Sprite2D bed-valley.png
        Logic      ValleyLogic ROWS + crops
      ZoneMap      kitchen / mine / wild (unchanged)
      ActorView    char-warm / char-pine
    Camera2D
    HUD CanvasLayer
```

`app.gd` `show_play()` instantiates `play.tscn`. `ValleyWorld.new()` still sits a bed if the packed children are missing so headless scripts can construct a world.

Torn out: `_houses`, `_ridge`, `_shore`, `_bits`, `_land` sticker stamps; `class_name ValleyMap` as the play look.

### Key Interfaces

```
class_name ValleyWorld
func size_px() -> Vector2
func show_crops(plots: Array) -> void
```

### Implementation Guidelines

- Packed scenes are the graph. Do not rebuild the valley from a list of prop names.
- Crops may still use `prop-tuft` / `prop-bush` (gameplay plots, not FAIL cover crops).
- Do not load `prop-cover-*`, `prop-hut`, `prop-lodge` in the valley scene.

## Alternatives Considered

### Alternative 1: New texture on ValleyMap

- **Description**: Keep `_paint` and swap the ground sheet
- **Rejection Reason**: Ordered overturned. Same sticker graph.

### Alternative 2: Magenta-key props (Path B)

- **Description**: New `prop-key-*` sheets
- **Rejection Reason**: Path A is preferred. Use only if a bed cannot land houses.

## Consequences

### Positive

- Enter frame cannot show a rectangular sticker box
- Scene files are the structure reviewers can read

### Negative

- Headless scripts that did `ValleyMap.new()` must instance `ValleyWorld` / `valley.tscn`

### Neutral

- Kitchen/mine stay `ZoneMap` for this rebuild

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Tests lock old ValleyMap strings | High | Suite red | Update look locks; keep CHARTER locks |
| Missing bed import | Medium | Pink square | Commit `bed-valley.png` + `.import` |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| Valley draw | 1 pad + 1 floor + ~10 stickers | 1 bed + crop sprites | 60 fps HTML5 |

## Migration Plan

1. Add `valley_world.gd`, `valley_logic.gd`, `valley.tscn`, `play.tscn`
2. Point `app.gd` / `play.gd` / headless at `ValleyWorld`
3. Delete sticker `valley_map.gd`
4. Leave FAIL PNGs on disk

**Rollback plan**: revert the scene files; do not recrop FAIL props.

## Validation Criteria

- [ ] `godot/scenes/valley.tscn` and `play.tscn` exist
- [ ] Play valley has no FAIL prop names
- [ ] `npm test` green
- [ ] HTML5 export at `godot/export/web/`

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| WORLD.md | Places | Valley is a place you walk | Logic grid + camera stay |
| ART.md / art-bible | Painted world | One dusk language | Bed node, not collage |
| CHARTER.md | P1 look | Overturn failed slice | New scene graph |
