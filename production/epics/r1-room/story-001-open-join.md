# Story 001: Open / join room

> **Epic**: Room code
> **Status**: Ready
> **Layer**: Foundation
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-net-001`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Room UI sits on the cover with a wood plaque
- [ ] Open room / join by four-digit code through `Net`
- [ ] 暖 / 松 side pick
- [ ] No 魂, no Wilson

## Implementation Notes

Keep `room.gd` + `net.gd`. Do not rewrite the protocol.

## Out of Scope

- Valley look
- Pair fish rules (already in sim)

## QA Test Cases

- **AC-1**: Room uses cover + Net
  - Given: `room.gd` and `net.gd`
  - When: tests read them
  - Then: cover-valley, join signals, no Wanderer

## Test Evidence

existing `godot/project.test.ts` + CHARTER locks
**Status**: [x] P0

## Dependencies

- Depends on: r1-title
- Unlocks: r1-painted-valley, r1-two-players
