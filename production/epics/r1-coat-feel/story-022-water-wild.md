# Story 022: Water and wild

> **Epic**: Coat walk and sit feel
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md` + `docs/CHARTER.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Live leftover after enter-place: 做 reaches kitchen / mine, but not the painted water or the wild edge. On the stream / dock tile, 做 starts the existing fish pull. On the valley out-gate tile, 做 enters `bed-wild`. No rod sticker. No gate sticker. Prompt is a small wood slip.

This is coat-feel 022. Evening-places fireside 019 stays parked.

## Acceptance Criteria

- [x] 做 on the stream / dock tile starts the existing fish pull; wood slip prompt; no rod sticker
- [x] 做 on the valley wild / out-gate tile enters `bed-wild`; no gate sticker
- [x] Existing beds and existing fish rules; no new art
- [x] Play-path prints `PLAY_WATER_FISH` / `PLAY_ENTER_WILD` / `PLAY_WATER_OK`
- [x] BODY 240; camera 2.18; same idle face; stickers off; no 魂
- [x] 021 enter-place Complete; fireside 019 parked; two-phone Blocked

## Implementation Notes

Godot look + the existing dock / gate tiles. 做 on the water or the out-gate must reach. Do not generate a new face. Do not hang `prop-dock` / `prop-gate`. Do not recrop FAIL. Do not replace a bed that already holds. Do not unpark fireside. Two-phone stays Blocked / human. Do not start a new WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- New rod / gate sticker / title-couple paste
- New HUD chrome / sticker pad
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen enter-place (021 stays Complete)

## QA Test Cases

- **AC-1**: 做 on water fishes; 做 on the out-gate enters wild
  - Setup: `play_water.tscn` walks Play to the dock, then the out-gate
  - Verify: fish pull starts; `bed-wild.png` sits; no rod / gate sticker
  - Pass condition: `PLAY_WATER_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_water.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–021 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. 做 on the stream / dock tile starts the existing fish pull. 做 on the out-gate enters `bed-wild`. Wood slip prompt. No rod or gate sticker.
**Deviations**: None. Lean: no new bed, no rod prop, no gate prop.
**Test Evidence**: Integration — `godot/project.test.ts` water-wild lock + `PLAY_WATER_OK`. `PLAY_ENTER_OK` still holds.
**Code Review**: Skipped — lean
