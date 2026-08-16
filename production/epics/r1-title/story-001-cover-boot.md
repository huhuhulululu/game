# Story 001: Title is the cover

> **Epic**: Title cover
> **Status**: Complete
> **Layer**: Foundation
> **Type**: UI
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003: One painted warm-dusk world
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Boot shows `cover-valley.png` only (no character sticker collage)
- [x] Cover file is not written by play tools
- [x] Tap / click goes to room
- [x] No 魂 on the title

## Implementation Notes

Keep `boot.gd`. Do not sit FAIL props on the title. `tools/paint_look.py` reads the locked cover and does not write `cover-valley.png`.

## Out of Scope

- Play valley bed (r1-painted-valley)
- Room plaque copy (r1-room)

## QA Test Cases

- **AC-1**: Boot cover
  - Setup: Open HTML5 or instance `boot.gd`
  - Verify: One cover texture, no `char-warm` on the title
  - Pass condition: `boot.gd` loads `cover-valley`; tests lock this

## Test Evidence

**Story Type**: UI
**Required evidence**: `godot/project.test.ts` boot locks + `production/qa/evidence/title-cover-boot-evidence.md`
**Status**: [x] Complete — cover + tap already held; play tools no longer write the plate

## Dependencies

- Depends on: None
- Unlocks: r1-room

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 4/4 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: UI — boot loads `cover-valley` only; `paint_look.py` does not `save` the cover
**Code Review**: Skipped — lean
