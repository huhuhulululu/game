# Story 001: Stick, 做, 喊

> **Epic**: Move / do / shout
> **Status**: Complete
> **Layer**: Core
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-play-001`
**ADR Governing Implementation**: ADR-0002

## Acceptance Criteria

- [x] Play sends move / act / held / ping through `Net.send_input`
- [x] HUD has 做 and 喊 wood buttons
- [x] Camera clamps to the valley bed size
- [x] Shout still paints a ping on the other body

## Implementation Notes

Keep input in `play.gd`. After the packed-scene swap, camera still calls `ValleyWorld.size_px()`.

## Out of Scope

- Rewriting Net

## QA Test Cases

- Tests lock `_clamp_cam`, 做 / 喊, `send_input`, mate ping

## Test Evidence

`godot/project.test.ts`
**Status**: [x] Complete — re-verified after packed bed

## Dependencies

- Depends on: r1-painted-valley
- Unlocks: r1-first-evening

## Completion Notes
**Completed**: 2026-08-15
**Criteria**: 4/4 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped.
**Test Evidence**: Integration — `godot/project.test.ts` (`Cover-coat people walk and act on the painted bed` + shout/ping locks)
**Code Review**: Skipped — lean
