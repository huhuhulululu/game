# Story 015: Quiet name

> **Epic**: Coat walk and sit feel
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md` + `docs/CHARTER.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Live leftover after the quiet log: a boxed label floats over the coat (晓 / 暖) like a DST nametag. Make it quiet ink above the coat, or hide it when it is you. No ornate wood frame around the name. Mate can keep a small ink name so you know who is who.

## Acceptance Criteria

- [ ] Your name plate is hidden; no boxed DST nametag over your coat
- [ ] Mate keeps a small ink name, no ornate wood frame
- [ ] Title stays the painted cover; hands stay small slips; log stays hidden when empty; BODY stays 192
- [ ] HUD stays plaque + one bag slip; torn props stay off
- [ ] `bed-valley.png` not replaced; no 魂; no look names in `src/`
- [ ] Play-path + test locks; 014 stays Complete

## Implementation Notes

Godot look only. Do not invent a new nametag chrome. Drop `name_box` / `tex-plaque` from the floating name. Hide when it is you. Mate is ink only. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new nametag chrome
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings / action wheel
- Another systems story
- Reopen quiet log (014 stays Complete)

## QA Test Cases

- **AC-1**: Your name is hidden; mate is quiet ink
  - Setup: `play_name.tscn` feeds Play with you + mate
  - Verify: no plaque frame over the coat; you hidden; mate ink visible; BODY 192
  - Pass condition: `PLAY_NAME_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_name.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–014 Complete
- Unlocks: none. Stop new WORLD systems.
