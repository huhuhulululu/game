# Story 011: Painted room

> **Epic**: Coat walk and sit feel
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md` + `docs/CHARTER.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Live leftover after the warm sit: the 开一间 / 房间码 card is a cheap parchment box with a ragged pixel border, sitting under the painted cover. Name chips and the two buttons read as a web form. Make that card the same dusk wood as the valley plaque.

## Acceptance Criteria

- [x] Room card is dusk wood-ink, not a stretched parchment plaque; 暖 / 松 and 开一间 / 我有房间码 feel like the wood HUD
- [x] Title stays the painted cover; no title-couple paste into the valley; BODY stays 192
- [x] A clip-art panel is thrown away — keep a simple wood slip; torn props stay off
- [x] `bed-valley.png` not replaced; HUD stays plaque + one bag slip; no 魂; no look names in `src/`
- [x] Play-path + test locks

## Implementation Notes

Godot look only. Do not stretch `tex-plaque` into a tall form card. Painted a simple cabin-board slip for the room card. A first crop tiled the cabin door and lantern — that was thrown away. Name chips and the two buttons use the HUD wood slip. Do not recrop FAIL. Do not hang hole / silk / torch / smith. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another systems story
- Reopen warm sit (010 stays Complete)

## QA Test Cases

- **AC-1**: Room card is dusk wood on the painted cover
  - Setup: `play_room.tscn` opens the room scene on the cover
  - Verify: cover stays; card is `tex-room`; chips/buttons are wood slips; no FAIL props; BODY 192
  - Pass condition: `PLAY_ROOM_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_room.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–010 Complete
- Unlocks: none. Stop new WORLD systems.
