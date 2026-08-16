# Story 013: Quiet hands

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

Live leftover after the painted join: in-valley 声 / 喊 / 做 are three identical ornate wood-framed squares stacked on the painting. That is DST action chrome. Make them quiet ink / wood chips in the same language as the plaque — small, not a hard stack of boxes.

## Acceptance Criteria

- [x] 做 / 喊 are small wood slips (`tex-slip`), not stacked `tex-plaque` squares
- [x] Mute 声 stays a tiny slip; no DST action wheel
- [x] Title stays the painted cover; no title-couple paste; BODY stays 192
- [x] A clip-art button sheet is thrown away — keep simple wood slips; torn props stay off
- [x] `bed-valley.png` not replaced; HUD stays plaque + one bag slip; no 魂; no look names in `src/`
- [x] Play-path + test locks; 011 / 012 stay Complete

## Implementation Notes

Godot look only. Reuse `tex-slip.png`. Do not generate a new button sheet. Shipping clip-art is the failure. Do not add a DST wheel. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new generated button sheet
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings / action wheel
- Another systems story
- Reopen painted room / painted join (011 / 012 stay Complete)

## QA Test Cases

- **AC-1**: In-valley hands are quiet wood chips
  - Setup: `play_quiet.tscn` opens Play and reads 做 / 喊 / 声
  - Verify: chips are `tex-slip`; not a hard stack of plaque boxes; 声 is tiny; no FAIL props; BODY 192
  - Pass condition: `PLAY_QUIET_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_quiet.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–012 Complete
- Unlocks: none. Stop new WORLD systems.
