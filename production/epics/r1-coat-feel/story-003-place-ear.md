# Story 003: Place ear

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

- [ ] Kitchen hears a thin hearth bed and a chop tone through `play.tscn`
- [ ] Mine hears a thin vein tone through `play.tscn`
- [ ] Play-path proof prints place-ear tokens through `play.tscn`
- [ ] Generated tones only; no sample pack; no 魂; no Don't Starve chrome; no FAIL restick; `bed-valley.png` untouched

## Implementation Notes

Same `ValleyEar`. Kitchen hearth is a generated loop. Chop and vein are generated one-shots. Do not port night / ready / bite / dark. Mute does not send. Do not recrop FAIL. Do not touch `bed-valley.png`. Two-phone stays Blocked / human.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Rewrite `bed-valley.png`
- New wav / ogg pack
- 魂 / Wilson / Don't Starve chrome

## QA Test Cases

- **AC-1**: Play hears hearth, chop, and vein
  - Setup: `play_place.tscn` feeds kitchen hearth / chop, then a mine vein
  - Verify: hearth bed, chop beep, vein beep; mute does not send
  - Pass condition: `PLAY_PLACE_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_place.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel thin-audio, r1-evening-places kitchen / mine
- Unlocks: none (two-phone stays human)
