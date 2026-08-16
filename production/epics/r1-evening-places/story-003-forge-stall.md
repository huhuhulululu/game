# Story 003: Forge and stall

> **Epic**: Evening places look
> **Status**: Ready
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (工坊 / 摊位) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] 砧 and 摊 sit on valley `Y` / `S` in the same dusk language
- [ ] New names (not `prop-anvil.png` / `prop-stall.png` on valley scripts)
- [ ] Magenta-key with real `a=0`, or painted into the bed
- [ ] No FAIL restick; no 魂; no Don't Starve face

## Implementation Notes

Packed-bed tests forbid `prop-anvil.png` / `prop-stall.png` on valley scripts. Sit new files. ART: 宁肯少，也不要摊、砧 hung as a second language.

## Out of Scope

- Kitchen / mine beds
- Recrop FAIL PNGs

## Dependencies

- Depends on: r1-village-wild
- Unlocks: sleep look
