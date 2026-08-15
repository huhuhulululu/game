# Story 001: Packed valley, one bed

> **Epic**: Valley as one painting
> **Status**: In Progress
> **Layer**: Foundation
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**GDD**: `design/assets/specs/valley-assets.md`
**Requirement**: `TR-look-001`, `TR-look-002`, `TR-graph-001`
**ADR Governing Implementation**: ADR-0001 (primary), ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

**Control Manifest Rules (this layer)**:
- Required: Packed play/valley scenes. Cover read-only.
- Forbidden: FAIL cover props on the valley. Second project.
- Guardrail: One bed sheet.

## Acceptance Criteria

- [x] `godot/scenes/valley.tscn` + `play.tscn` exist; App instances `play.tscn`
- [x] Valley look is one `bed-valley.png` (1224×612 RGB or clean opaque)
- [x] No `prop-cover-tree`, `prop-cover-tree-b`, `prop-cover-lamp`, `prop-cover-shore`, `prop-cover-verge`, `prop-hut`, `prop-lodge` in the play valley
- [x] Those FAIL files still exist on disk and are not overwritten
- [x] `cover-valley.png` untouched
- [x] No rectangular sticker box; no leftover dusk RGB in transparent pixels
- [x] Logic ROWS + `show_crops` still work
- [x] No 魂; no Don't Starve face; no second pack

## Implementation Notes

From ADR-0001 / ADR-0003: packed scene graph; `tools/paint_valley_bed.py` writes only the bed; hard-fill path under baked people; crop title off the play sheet. Delete sticker `valley_map.gd`. Headless uses `ValleyWorld`.

## Out of Scope

- Recropping FAIL PNGs
- Kitchen / mine / wild look
- Rewriting Net or `src/sim`
- Overwriting WORLD / CHARTER

## QA Test Cases

- **AC-1**: Scene graph
  - Setup: read `app.gd`, `play.tscn`, `valley.tscn`
  - Verify: play is instanced; valley has Bed + Logic
  - Pass condition: tests match packed paths; no FAIL names in valley scripts
- **AC-2**: Bed file
  - Setup: open `bed-valley.png`
  - Verify: 1224×612 RGB
  - Pass condition: no alpha leftover; cover hash unchanged

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `production/qa/evidence/packed-bed-evidence.md` + `godot/project.test.ts`
**Status**: [ ] creating this rebuild

## Dependencies

- Depends on: r1-room (P0 done)
- Unlocks: r1-two-players walk on the bed
