# Story 006: Spoil and icebox

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (腐坏 / 冰柜) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Kitchen icebox stays the existing magenta-key `prop-cool` on tile `R`; do not hang DST `prop-icebox`
- [ ] Food chips show spoil ticks from snap `fresh` (还行 / 蔫了 / 坏了)
- [ ] Kitchen shows ice chips from snap `ice`; valley does not
- [ ] Play-path proof prints spoil-icebox tokens through `play.tscn`
- [ ] No 魂; no Don't Starve face; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already ages bag / ice. Do not move those rules into Godot. Sit the cool box already in the kitchen. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Hang or restyle `prop-icebox.png`
- New spoil / icebox art pack
- 魂 / Wilson / Don't Starve chrome

## QA Test Cases

- **AC-1**: Play shows spoil ticks and the kitchen icebox
  - Setup: `play_spoil.tscn` feeds wilted bag food, kitchen ice, then a valley snap
  - Verify: `prop-cool` sits; chips tick; ice chips stay kitchen-only
  - Pass condition: `PLAY_SPOIL_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_spoil.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places kitchen bed
- Unlocks: none (two-phone stays human)
