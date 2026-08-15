# Story 001: Title is the cover

> **Epic**: Title cover
> **Status**: Ready
> **Layer**: Foundation
> **Type**: UI
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**GDD**: `godot/docs/ART.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003: One painted warm-dusk world
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Boot shows `cover-valley.png` only (no character sticker collage)
- [ ] Cover file is not written by play tools
- [ ] Tap / click goes to room
- [ ] No 魂 on the title

## Implementation Notes

Keep `boot.gd`. Do not sit FAIL props on the title.

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
**Required evidence**: existing `godot/project.test.ts` boot locks
**Status**: [x] P0 already green; keep locks

## Dependencies

- Depends on: None
- Unlocks: r1-room
