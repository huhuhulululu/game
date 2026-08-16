# Story 021: Enter place

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

Live leftover after HTML5 hands: 做 fires, but it does not reach a place. Walk to a painted door / kitchen / mine / wild edge on the existing beds and 做. The bed should change. Kitchen / mine / wild are already painted. Do not hang a door sticker. Prompt can be a small wood slip.

This is coat-feel 021. Evening-places fireside 019 stays parked.

## Acceptance Criteria

- [x] Walk to a painted kitchen / mine / wild edge and 做; the bed changes
- [x] Existing `bed-kitchen.png` / `bed-mine.png` / `bed-wild.png` sit; no new bed unless empty fill
- [x] No door sticker; no new props; prompt is a small wood slip
- [x] Play-path prints `PLAY_ENTER_KITCHEN` / `PLAY_ENTER_MINE` / `PLAY_ENTER_OK`
- [x] BODY 240; camera 2.18; same idle face; stickers off; no 魂
- [x] 020 html5-hands Complete; fireside 019 parked; two-phone Blocked

## Implementation Notes

Godot look + the existing enter tiles. 做 on the door tile must reach. Do not generate a new face. Do not hang `prop-door-open`. Do not recrop FAIL. Do not replace a bed that already holds. Do not unpark fireside. Two-phone stays Blocked / human. Do not start a new WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- New door sticker / title-couple paste
- New HUD chrome / sticker pad
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen html5-hands (020 stays Complete)

## QA Test Cases

- **AC-1**: 做 at a painted door changes the bed
  - Setup: `play_enter.tscn` walks Play to the kitchen door, then the mine door
  - Verify: 做 at the door; `bed-kitchen.png` then `bed-mine.png`; no door sticker
  - Pass condition: `PLAY_ENTER_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_enter.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–020 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. 做 on the kitchen / mine tile enters. Existing beds sit. Wood slip prompt. No door sticker.
**Deviations**: None. Lean: no new bed, no door prop.
**Test Evidence**: Integration — `godot/project.test.ts` enter-place lock + `PLAY_ENTER_OK`. `PLAY_HANDS_OK` still holds.
**Code Review**: Skipped — lean
