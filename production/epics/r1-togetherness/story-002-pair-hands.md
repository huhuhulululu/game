# Story 002: Pair hands

> **Epic**: Togetherness on the painted world
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (同钓 / 工坊 / 摊位 / 歇一夜) + `godot/docs/ART.md`
**Requirement**: `TR-pair-001`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Pair-fish distance shows two cover-coats in the fish pose on `bed-valley.png` (prompt 两人同钓)
- [x] Dual 做 at forge and stall shows two coats, not a pair-stat HUD
- [x] Dual sleep shows two sit poses; no second indoor bed
- [x] Play-path proof prints pair-hands tokens through `play.tscn`
- [x] No 魂; no Don't Starve face; no FAIL restick; no extra valley props; no look names in `src/`

## Implementation Notes

Server already has `pairFishing`, forge/stall dual 做, and two-person sleep. Do not move those rules into Godot. Do not paint a bonus number. Two coats on the existing bed / smith / booth. Do not pile props. Two-iPhone playtest stays later.

## Out of Scope

- Two-iPhone human playtest
- Recrop FAIL PNGs
- New valley props
- Pair quality / bond HUD

## QA Test Cases

- **AC-1**: Play shows pair hands as two coats
  - Setup: `play_hands.tscn` feeds pair-fish, dual forge/stall, dual sit
  - Verify: both coats, pair prompts, no pair-stat plaque
  - Pass condition: `PLAY_HANDS_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_hands.tscn` tokens + `production/qa/evidence/pair-hands-evidence.md`
**Status**: [x] Complete — Play-path tokens + 119 tests

## Dependencies

- Depends on: r1-togetherness shared valley, r1-evening-places
- Unlocks: later two-iPhone playtest (not this slice)

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — `PLAY_PAIR_FISH` `PLAY_PAIR_FORGE` `PLAY_PAIR_STALL` `PLAY_PAIR_SLEEP` `PLAY_HANDS_OK`
**Code Review**: Skipped — lean
