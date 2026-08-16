# Story 004: Sleep

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (歇一夜) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Sleep / lie-down uses the cover-coat sit pose on `bed-valley.png`, not a second indoor room
- [x] Timing bar stays off while `busy == sit` (no bed HUD)
- [x] Smith / booth stay small and grounded on the valley
- [x] Play-path proof prints sleep tokens through `play.tscn`
- [x] No 魂; no Don't Starve face; no FAIL restick; no look names in `src/`

## Implementation Notes

Cabin is already on `bed-valley.png`. Prefer the existing cover-coat sit pose over a new indoor sleep zone. Do not invent a DST bed HUD. Do not recrop FAIL. Do not restyle kitchen / mine.

## Out of Scope

- Kitchen / mine restyle
- Recrop FAIL PNGs
- New indoor sleep map

## QA Test Cases

- **AC-1**: Play sits the cover-coat sleep pose on the valley
  - Setup: `play_sleep.tscn` feeds a night valley snap with `busy: sit`
  - Verify: `char-warm-sit`, `bed-valley`, valley visible, fish HUD off
  - Pass condition: `PLAY_SLEEP_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_sleep.tscn` tokens + `production/qa/evidence/sleep-look-evidence.md`
**Status**: [x] Complete — Play-path tokens + 116 tests

## Dependencies

- Depends on: r1-two-players cover-coats
- Unlocks: none in this epic

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_SLEEP_SIT` `PLAY_SLEEP_VALLEY` `PLAY_SLEEP_OK`
**Code Review**: Skipped — lean
