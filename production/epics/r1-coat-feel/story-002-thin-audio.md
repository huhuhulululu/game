# Story 002: Thin audio

> **Epic**: Coat walk and sit feel
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/CHARTER.md` (薄声音) + `docs/WORLD.md`
**Requirement**: `TR-play-001`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] 做 / 喊 / sit still fire the existing thin tones through `play.tscn`
- [ ] Valley dusk plays a thin looping bed; mute stops the ear, not the world
- [ ] Play-path proof prints thin-audio tokens through `play.tscn`
- [ ] No new art / sample pack; no 魂; no Don't Starve chrome; no FAIL restick; `bed-valley.png` untouched

## Implementation Notes

`ValleyEar` already has 做 / 喊 / sit beeps. Add a dusk bed if missing. Do not port a second audio language. Mute does not send. Do not recrop FAIL. Do not touch `bed-valley.png`. Two-phone stays Blocked / human.

## Out of Scope

- Two-iPhone playtest (`story-003-two-phone.md`)
- Recrop FAIL PNGs
- Rewrite `bed-valley.png`
- New wav / ogg pack
- 魂 / Wilson / Don't Starve chrome

## QA Test Cases

- **AC-1**: Play hears thin 做 / 喊 / sit and a dusk bed
  - Setup: `play_ear.tscn` feeds act, shout, sit, then mute
  - Verify: tones + dusk ambient; mute does not send
  - Pass condition: `PLAY_EAR_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_ear.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel walk/sit, r1-move-do-shout
- Unlocks: none (two-phone stays human)
