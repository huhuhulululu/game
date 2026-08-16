# Story 024: Sleep and sit

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

Live leftover after cook-dig: 做 reaches a painted door, the stream, the out-gate, the pot, and the vein, but not the house tile once you are standing on it. On the house / bed tile, 做 uses the existing sleep rules. One person can rest; pair wait is already WORLD. Wood slip 歇一夜. Near the painted hearth, the existing sit pose and fireside toast already hold. No new bed prop. No new fire sticker.

This is coat-feel 024. Evening-places fireside 019 stays parked.

## Acceptance Criteria

- [x] 做 on the house / bed tile uses the existing sleep rules; wood slip 歇一夜; existing sit sheet; no new bed prop
- [x] 做 near the painted hearth uses the existing sit / fireside toast if the server already has it; no new fire sticker
- [x] Existing valley bed and existing sleep / sit rules; no new art
- [x] Play-path prints `PLAY_SLEEP` / `PLAY_SIT` / `PLAY_REST_OK`
- [x] BODY 240; camera 2.18; same idle face; stickers off; no 魂
- [x] 023 cook-dig Complete; fireside 019 parked; two-phone Blocked

## Implementation Notes

Godot look + the existing valley bed. 做 on the house tile must reach. Do not generate a new face. Do not hang `prop-bed` / `prop-fire` / `prop-hearth` / `prop-camp-pot`. Do not recrop FAIL. Do not replace a bed that already holds. Do not unpark fireside. Two-phone stays Blocked / human. Do not start a new WORLD system. Do not add a sit-on-做.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- New bed / fire sticker / title-couple paste
- New HUD chrome / sticker pad
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen cook-dig (023 stays Complete)

## QA Test Cases

- **AC-1**: 做 on the house tile sleeps; hearth sit uses the existing pose
  - Setup: `play_rest.tscn` walks Play to the house tile, then the hearth
  - Verify: 歇一夜 slip; existing sit sheet; no bed / fire sticker
  - Pass condition: `PLAY_REST_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_rest.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–023 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. 做 on the house tile uses the existing sleep. Night at the hearth uses the existing sit. Wood slip 歇一夜. No bed or fire sticker.
**Deviations**: None. Lean: no new bed, no fire prop, no sit-on-做.
**Test Evidence**: Integration — `godot/project.test.ts` sleep-sit lock + `PLAY_REST_OK`. `PLAY_COOK_OK` still holds.
**Code Review**: Skipped — lean
