# Story 001: Open / join room

> **Epic**: Room code
> **Status**: Complete
> **Layer**: Foundation
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**Requirement**: `TR-net-001`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Room UI sits on the cover with a wood plaque
- [x] Open room / join by four-digit code through `Net`
- [x] 暖 / 松 side pick
- [x] No 魂, no Wilson

## Implementation Notes

Keep `room.gd` + `net.gd`. Do not rewrite the protocol. Plaque and 开一间 stay dusk/wood. No character stickers on the room.

## Out of Scope

- Valley look
- Pair fish rules (already in sim)

## QA Test Cases

- **AC-1**: Room uses cover + Net
  - Given: `room.gd` and `net.gd`
  - When: tests read them
  - Then: cover-valley, join signals, no Wanderer

## Test Evidence

`godot/project.test.ts` + CHARTER locks + `production/qa/evidence/room-open-join-evidence.md`
**Status**: [x] Complete — cover + wood plaque + 开一间 already held

## Dependencies

- Depends on: r1-title
- Unlocks: r1-painted-valley, r1-two-players

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 4/4 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — room loads `cover-valley`, wood 开一间 / 暖 / 松, no 魂 / Wilson
**Code Review**: Skipped — lean
