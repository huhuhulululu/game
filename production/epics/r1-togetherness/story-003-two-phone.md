# Story 003: Two-phone playtest

> **Epic**: Togetherness on the painted world
> **Status**: Blocked
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` + `docs/CHARTER.md` (两机实玩)
**Requirement**: `TR-pair-001`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Brainbird plays on two iPhones in one room: 开一间, walk, 做, 喊
- [ ] Pair-fish, kitchen rush pass, and sleep both-lie-down are felt on both phones
- [ ] No 魂; no Don't Starve face; one painted dusk language

## Implementation Notes

**Human gate. Do not implement this slice.** Server and Play already show two coats from one snap. This story waits on Brainbird with two phones. Agents must not treat a Play-path or one-machine loop as a substitute.

## Out of Scope

- Agent implementation / `/dev-story`
- Recrop FAIL PNGs
- New look / props
- Moving authority into Godot

## Blocked reason

Needs Brainbird two-iPhone playtest. Not an agent slice.

## QA Test Cases

- **AC-1**: Two phones share one evening
  - Setup: two iPhones, one room code
  - Verify: both coats, 喊, pair 做, kitchen rush, sleep
  - Pass condition: Brainbird sign-off

## Test Evidence

**Story Type**: Integration
**Required evidence**: human playtest note in `production/qa/evidence/`
**Status**: [ ] Blocked — human

## Dependencies

- Depends on: r1-togetherness 001/002, r1-evening-places kitchen rush
- Unlocks: CHARTER P1 two-phone close
