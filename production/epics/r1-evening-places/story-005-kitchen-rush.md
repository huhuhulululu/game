# Story 005: Kitchen rush

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (堂口 / Overcooked only in kitchen) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Rush shows two cover-coats on `bed-kitchen.png` at hearth / chop / oven / serve (place 厨房 · 堂口热)
- [x] Dual 做 uses the existing chop pose; no new pack
- [x] Order slips stay wood and kitchen-only; no rush tickets on the valley
- [x] Play-path proof prints kitchen-rush tokens through `play.tscn`
- [x] No 魂; no Don't Starve face; no FAIL restick; no extra valley props; no look names in `src/`

## Implementation Notes

Server already has `rushed`, orders, and pair pass. Do not move those rules into Godot. Do not paint combo / bond. Overcooked stays in the kitchen. Do not restyle the kitchen bed. Do not pile valley props. Two-iPhone playtest stays later.

## Out of Scope

- Two-iPhone human playtest
- Recrop FAIL PNGs
- New kitchen / valley props
- New character pack
- Combo / bond HUD

## QA Test Cases

- **AC-1**: Play shows kitchen rush as two coats
  - Setup: `play_rush.tscn` feeds rush, dual 做, then a valley snap with leftover tickets
  - Verify: both coats at stations, wood slips in kitchen only
  - Pass condition: `PLAY_RUSH_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_rush.tscn` tokens + `production/qa/evidence/kitchen-rush-evidence.md`
**Status**: [x] Complete — Play-path tokens + 120 tests

## Dependencies

- Depends on: r1-evening-places kitchen bed, r1-togetherness pair hands
- Unlocks: later two-iPhone playtest (not this slice)

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — `PLAY_RUSH_HOT` `PLAY_RUSH_DO` `PLAY_RUSH_ONLY` `PLAY_RUSH_OK`
**Code Review**: Skipped — lean
