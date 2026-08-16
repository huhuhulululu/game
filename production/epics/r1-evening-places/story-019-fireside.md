# Story 019: Fireside

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (火边) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Night, two coats near a lit campfire or house lamp can show `火边坐了一会儿` from the snap; `tickHearth` stays in the server
- [ ] Sit pose and campfire / hearth already in; no new sticker; no DST fire ring
- [ ] One coat sitting does not show the toast; kitchen / valley stay as they are
- [ ] Play-path proof prints fireside tokens through `play.tscn`
- [ ] No 魂; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already toasts `火边坐了一会儿` when both sit by a lit fire or house lamp. Do not move hunger / bond into Godot. Sit the toast on the sit pose and campfire already in. Do not add a fire ring. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. Do not invent more props. Stop new WORLD systems after this.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New sticker props / DST fire ring
- Bond / hunger HUD
- Weather slices (wind / snow)
- New wild props
- 魂 / Wilson / Don't Starve chrome / sticker box

## QA Test Cases

- **AC-1**: Play sits the fireside toast from the snap
  - Setup: `play_side.tscn` feeds two coats at a lit wild fire, then kitchen lamp, then one coat alone
  - Verify: toast only when both sit; sit sheets; existing fire / hearth; no fire ring; `bed-valley.png` untouched
  - Pass condition: `PLAY_SIDE_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_side.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places campfire pot, r1-coat-feel walk-sit
- Unlocks: none. Stop new WORLD systems.
