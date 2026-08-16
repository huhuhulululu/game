# Story 023: Cook and dig

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

Live leftover after water-wild: 做 reaches a painted door, the stream, and the out-gate, but not the pot or the vein once you are already inside. On the kitchen pot tile, 做 uses the existing pot / cook rules. On the mine vein tile, 做 uses the existing dig rules. No pot sticker. No pick sticker. Prompt is a small wood slip.

This is coat-feel 023. Evening-places fireside 019 stays parked.

## Acceptance Criteria

- [x] 做 on the kitchen pot tile uses the existing pot / cook rules; wood slip prompt; no pot sticker
- [x] 做 on the mine vein tile uses the existing dig / vein rules; wood slip prompt; no pick sticker
- [x] Existing beds and existing cook / dig rules; no new art
- [x] Play-path prints `PLAY_COOK` / `PLAY_DIG` / `PLAY_COOK_OK`
- [x] BODY 240; camera 2.18; same idle face; stickers off; no 魂
- [x] 022 water-wild Complete; fireside 019 parked; two-phone Blocked

## Implementation Notes

Godot look + the existing kitchen / mine tiles. 做 on the pot or the vein must reach. Do not generate a new face. Do not hang `prop-pot` / `prop-vein`. Do not recrop FAIL. Do not replace a bed that already holds. Do not unpark fireside. Two-phone stays Blocked / human. Do not start a new WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- New pot / pick sticker / title-couple paste
- New HUD chrome / sticker pad
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen water-wild (022 stays Complete)

## QA Test Cases

- **AC-1**: 做 on the pot cooks; 做 on the vein digs
  - Setup: `play_cook.tscn` walks Play to the pot, then the vein
  - Verify: pot slip; ore in hand; no pot / pick sticker
  - Pass condition: `PLAY_COOK_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_cook.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–022 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. 做 on the pot tile uses the existing pot. 做 on the vein tile digs. Wood slip prompt. No pot or pick sticker.
**Deviations**: None. Lean: no new bed, no pot prop, no pick prop.
**Test Evidence**: Integration — `godot/project.test.ts` cook-dig lock + `PLAY_COOK_OK`. `PLAY_WATER_OK` still holds.
**Code Review**: Skipped — lean
