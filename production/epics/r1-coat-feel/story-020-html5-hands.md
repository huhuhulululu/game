# Story 020: HTML5 hands

> **Epic**: Coat walk and sit feel
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md` + `docs/CHARTER.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Live leftover after path-frame: a browser playtest could not move the coat or fire 做. The scene stayed static. Input only. HTML5 must accept the virtual stick, WASD, click-to-walk, and 做 / 喊. No DST joystick chrome. Keep the quiet wood slips.

This is coat-feel 020. Evening-places fireside 019 stays parked. Evening-places 020 strip-stickers stays Complete.

## Acceptance Criteria

- [ ] WASD / virtual stick / click-to-walk send walk; 做 / 喊 fire
- [ ] Play-path actually moves the coat and prints `PLAY_HANDS_MOVE` / `PLAY_HANDS_DO` / `PLAY_HANDS_OK`
- [ ] If Godot already hears input but the web export does not, fix canvas focus / input map / unhandled click
- [ ] No DST joystick chrome ring; 做 / 喊 stay quiet wood slips
- [ ] BODY 240; camera 2.18; same idle face; no new art; stickers off; no 魂
- [ ] 019 path-frame Complete; fireside 019 parked; two-phone Blocked

## Implementation Notes

Godot look / input only. Do not generate a new face. Do not hang a sticker pad. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Do not unpark fireside. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / joystick chrome / new HUD chrome
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen path-frame (019 stays Complete)

## QA Test Cases

- **AC-1**: Hands move the coat and fire 做
  - Setup: `play_html5.tscn` feeds Play, then pushes walk and 做
  - Verify: coat moves from input; 做 fires; no joystick ring; same `char-warm.png` language
  - Pass condition: `PLAY_HANDS_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_html5.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–019 Complete
- Unlocks: none. Stop new WORLD systems.
