# Story 014: Quiet log

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

Live leftover after quiet hands: a long empty cream wood bar sits across the bottom of the painting even when there is no ink. Same rule as the 做 leftover panel — no reserved empty box. Hide it until there is a real line. When a line exists, one small wood slip, not DST log chrome.

## Acceptance Criteria

- [ ] Empty bottom prompt bar is hidden; no reserved empty box
- [ ] A real line is one small wood slip (`tex-slip`), not a long DST log
- [ ] Title stays the painted cover; hands stay small slips; BODY stays 192
- [ ] HUD stays plaque + one bag slip; torn props stay off
- [ ] `bed-valley.png` not replaced; no 魂; no look names in `src/`
- [ ] Play-path + test locks; 013 stays Complete

## Implementation Notes

Godot look only. Do not invent a new log UI. Reuse the existing prompt slip. Hide when empty. Do not generate a new sheet. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new log chrome
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings / action wheel
- Another systems story
- Reopen quiet hands (013 stays Complete)

## QA Test Cases

- **AC-1**: Empty bottom bar stays off; a line is one small slip
  - Setup: `play_log.tscn` feeds Play with an empty prompt, then a real line
  - Verify: bar hidden when empty; small `tex-slip` when ink exists; no FAIL props; BODY 192
  - Pass condition: `PLAY_LOG_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_log.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–013 Complete
- Unlocks: none. Stop new WORLD systems.
