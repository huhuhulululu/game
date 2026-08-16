# Story 004: Sleep

> **Epic**: Evening places look
> **Status**: Ready
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

- [ ] Sleep / lie-down reads as the same dusk language (bed or sit pose, not a second room)
- [ ] No 魂; no Don't Starve face; no FAIL restick

## Implementation Notes

Cabin is already on `bed-valley.png`. Prefer the existing cover-coat sit pose over a new indoor sleep zone. Do not invent a DST bed HUD.

## Out of Scope

- Kitchen / mine / forge restyle
- Recrop FAIL PNGs

## Dependencies

- Depends on: r1-two-players cover-coats
- Unlocks: none in this epic
