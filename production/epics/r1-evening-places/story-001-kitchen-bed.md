# Story 001: Kitchen bed

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (厨房) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003: One painted warm-dusk world
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Kitchen sits one painted `bed-kitchen.png`, not tiled `tex-wood` wallpaper
- [x] Stations (cut / pot / stove / ice / pass / pantry / door) sit new magenta-key props with real `a=0`
- [x] Old ink kitchen pack stays on disk and is not hung in Play
- [x] Play-path proof prints kitchen tokens through `play.tscn`
- [x] No FAIL cover props; no 魂; no look names in `src/`

## Implementation Notes

Do not overwrite `prop-pot` / `prop-cut` / `prop-stove` / `prop-pass` / `prop-icebox` / `prop-pantry`. Sit new names. Keep `tex-wood.png` for kitchen walls (test lock). Do not recrop FAIL. Do not restyle mine.

## Out of Scope

- Mine bed
- Forge / stall on the valley
- Sleep look
- Recrop FAIL PNGs

## QA Test Cases

- **AC-1**: Play sits the kitchen bed and dusk stations
  - Setup: `play_kitchen.tscn` feeds a kitchen snap into `play.tscn`
  - Verify: `bed-kitchen`, hearth / chop / oven; no `prop-pot` / FAIL
  - Pass condition: `PLAY_KITCHEN_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_kitchen.tscn` tokens + `production/qa/evidence/kitchen-bed-evidence.md`
**Status**: [x] Complete — Play-path tokens + 113 tests

## Dependencies

- Depends on: r1-first-evening
- Unlocks: r1-evening-places mine

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_KITCHEN_BED` `PLAY_KITCHEN_POT` `PLAY_KITCHEN_OK`
**Code Review**: Skipped — lean
