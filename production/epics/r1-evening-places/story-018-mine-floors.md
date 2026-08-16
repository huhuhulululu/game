# Story 018: Mine floors

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (矿 · 多层) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Floor 1 → floor 2 sits on the same `bed-mine.png`; place can say `矿 N层`; `downFloor` stays in the server
- [ ] Lower floor may take a deeper dusk shade; one mine painting, not a new tileset
- [ ] Kitchen / valley / wild stay as they are; encounter toast can sit from the snap
- [ ] Play-path proof prints mine-floor tokens through `play.tscn`
- [ ] No 魂; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already keeps mine layers and the encounter table. Do not move those rules into Godot. Sit floor 1 → floor 2 on the existing mine bed. Do not invent a new mine tileset. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. Do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New mine tileset / four mine beds
- New sticker props
- Weather slices (wind / snow)
- New wild props
- 魂 / Wilson / Don't Starve chrome / sticker box

## QA Test Cases

- **AC-1**: Play sits floor 1 then floor 2 on one mine bed
  - Setup: `play_floor.tscn` feeds floor 1, floor 2, then kitchen / valley
  - Verify: place `矿 N层`; same `bed-mine.png`; deeper shade on floor 2; toast from snap; kitchen / valley untouched
  - Pass condition: `PLAY_FLOOR_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_floor.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places mine bed, seasons
- Unlocks: none in this epic
