# Story 001: Walk and sit-to-stand

> **Epic**: Coat walk and sit feel
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Walk uses a local stride on the existing walk / walk2 sheets (not wall-clock flicker)
- [ ] Sit and stand ease on the existing sit / stand sheets (no new pack)
- [ ] `Look.FOOT` stays `0.979`; feet stay planted
- [ ] Play-path proof prints coat-feel tokens through `play.tscn`
- [ ] No 魂; no Don't Starve face; no FAIL restick; no Wilson raws

## Implementation Notes

Onboarding already holds (cover → 开一间 → bed + 做 / 喊). This slice is feel only. Keep `char-warm-*` / `char-pine-*`. Do not recrop FAIL. Do not open `*-sit-raw` / `*-walk-raw`.

## Out of Scope

- New character pack
- Onboarding lecture copy
- Two-iPhone playtest
- Recrop FAIL PNGs

## QA Test Cases

- **AC-1**: Play walks then sits the cover-coats
  - Setup: `play_coats.tscn` feeds idle → move → sit → stand
  - Verify: walk sheet, sit sheet after ease, stand after rise
  - Pass condition: `PLAY_COAT_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_coats.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-two-players cover-coats
- Unlocks: none
