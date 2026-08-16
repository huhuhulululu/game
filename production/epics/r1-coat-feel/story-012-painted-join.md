# Story 012: Painted join

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

Live leftover after the painted room card: tapping 我有房间码 still reveals a cramped form row under the open chips. The join-code path must be the same dusk wood slip as 开一间 — not a leftover parchment / web form.

## Acceptance Criteria

- [x] Same `RoomCard` / `tex-room.png` after 我有房间码; no second panel; no `plaque_box` / `paper_box` on this card
- [x] Four-digit field is a HUD wood chip; confirm 进去 and back 回 are HUD wood chips
- [x] Title stays the painted cover; no title-couple paste; BODY stays 192
- [x] A clip-art join panel is thrown away — keep the simple wood slip; torn props stay off
- [x] `bed-valley.png` not replaced; HUD stays plaque + one bag slip; no 魂; no look names in `src/`
- [x] Play-path + test locks; 011 stays Complete

## Implementation Notes

Godot look only. Reuse `tex-room.png`. Do not generate `tex-join.png`. Shipping clip-art is the failure. Flip the same card to a join face: hide 开一间 / 我有房间码, show a full-width `wood_field("四位码")` named `JoinCode`, then chips 回 + 进去. Back restores the open face. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new generated panel
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another systems story
- Reopen painted room (011 stays Complete)

## QA Test Cases

- **AC-1**: Join-code card is the same dusk wood as 开一间
  - Setup: `play_join.tscn` opens the room scene, taps 我有房间码
  - Verify: cover stays; card is still `tex-room`; JoinCode / 进去 / 回 are wood slips; 回 restores 开一间; no FAIL props; BODY 192
  - Pass condition: `PLAY_JOIN_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_join.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–011 Complete
- Unlocks: none. Stop new WORLD systems.
