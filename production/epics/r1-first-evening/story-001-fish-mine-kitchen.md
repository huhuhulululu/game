# Story 001: Same snap, three places

> **Epic**: First evening — fish / mine / kitchen
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-play-002`
**ADR Governing Implementation**: ADR-0002

## Acceptance Criteria

- [x] Play still swaps valley / mine / kitchen from snap `zone`
- [x] Fish mark HUD still paints
- [x] Headless evening / cover loops still pass their OK tokens
- [x] No look added in `src/`

## Implementation Notes

Keep `zone_map.gd` and snap handlers. Valley hide/show uses `ValleyWorld`. First slice on the painted bed: walk + 做 / fish pose. Mine and kitchen stay the same snap; do not restyle their tiles. Do not hang props on the bed.

Zone switch and fish mark are proven through `play.tscn` (`headless_play_evening.gd` / `play_evening.tscn`), not only a posed `headless_look` fish shot. Cover loop drives Play and prints the same `PLAY_ZONE_*` / `PLAY_FISH_MARK` tokens.

## Out of Scope

- Restyling kitchen/mine tiles
- Wild look

## QA Test Cases

- Existing fish/mine/kitchen + evening loop tests
- Headless look `fish` shot: live coats 做/钓 on `bed-valley.png`
- Play-path snaps: valley bed visible, mine/kitchen ZoneMap, fish mark follows `fishMark`

## Test Evidence

`godot/project.test.ts`, `headless_play_evening.gd`, `headless_*_loop.gd`, `production/qa/evidence/first-evening-bed-slice-evidence.md`
**Status**: [x] Complete — Play-path tokens + live `EVENING_OK` / `COVER_LOOP_OK`

## Dependencies

- Depends on: r1-move-do-shout
- Unlocks: later village / wild look

## Completion Notes
**Completed**: 2026-08-15
**Criteria**: 4/4 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — `godot/project.test.ts` + `play_evening.tscn` tokens + live evening/cover loops
**Code Review**: Skipped — lean
