# Story 002: Mine bed

> **Epic**: Evening places look
> **Status**: Ready
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (矿) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Mine sits one painted dusk bed, not tiled stone wallpaper
- [ ] Ore / stairs / door sit magenta-key props with real `a=0`, or bake into the bed
- [ ] No FAIL restick; no 魂; no Don't Starve face

## Implementation Notes

Keep `tex-stone.png` string if tests lock it. Do not recrop FAIL. Kitchen is a separate story.

## Out of Scope

- Kitchen restyle
- Forge / stall
- Recrop FAIL PNGs

## Dependencies

- Depends on: r1-evening-places kitchen
- Unlocks: later forge / stall look
