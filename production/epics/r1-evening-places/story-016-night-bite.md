# Story 016: Night bite

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (夜里的黑暗) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Night wild with no held light / no campfire can show `被黑暗咬了一口` from the snap; `tickDark` stays in the server
- [ ] Painted night stays; no bite VFX sticker; no fear veil
- [ ] Village grass / path / farm stay lamp-safe; kitchen / mine stay hearth-lit; plaque unchanged
- [ ] Play-path proof prints night-bite tokens through `play.tscn`
- [ ] No 魂; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already bites unlit wild at night and keeps the valley village lamp-safe. Do not move those rules into Godot. Sit the toast on the painted night already in. Do not add a bite sticker. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. Do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- New wild props
- Bite VFX / fear veil / sanity HUD
- 魂 / Wilson / Don't Starve chrome / sticker box

## QA Test Cases

- **AC-1**: Play shows a night bite from the snap and keeps hearths / village lamps
  - Setup: `play_bite.tscn` feeds unlit night wild with the bite toast, a valley door warning, then kitchen / mine
  - Verify: toast from snap; painted night stays; no bite sticker; village / kitchen / mine do not bite; `bed-valley.png` untouched
  - Pass condition: `PLAY_BITE_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_bite.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places scout find, r1-coat-feel painted night
- Unlocks: none in this epic
