# Story 007: Quiet chrome

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

Live playtest after the walk cycle: leftover chrome. DOM title/subtitle bleeds under the canvas on load. Clicking 做 flashes a faint dark panel top-right.

## Acceptance Criteria

- [ ] DOM title/subtitle text does not bleed under the canvas; only the painted cover title shows
- [ ] 做 does not flash an empty leftover panel; no leftover geom / empty debug panels
- [ ] Title stays the painted cover; no title-couple paste; no new art; no new character
- [ ] Quiet HUD, BODY 192, stickers off, `bed-valley.png` untouched; no 魂
- [ ] Play-path + test locks; no look names in `src/`

## Implementation Notes

Godot look + HTML5 shell only. Kill `#status-title` / `#status-tag` in `godot/html/shell.html`. Do not reserve an empty toast/order box top-right. Do not generate art. Do not recrop FAIL. Do not hang torn-off props. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another systems story

## QA Test Cases

- **AC-1**: Load and 做 sit without leftover chrome
  - Setup: `play_chrome.tscn` feeds a valley snap and presses 做
  - Verify: no empty top-right panel; shell has no DOM title/tag; painted cover stays the title
  - Pass condition: `PLAY_CHROME_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_chrome.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–006 Complete
- Unlocks: none. Stop. Wait unless leftover geom remains.
