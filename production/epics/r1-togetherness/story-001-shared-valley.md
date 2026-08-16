# Story 001: Shared valley

> **Epic**: Togetherness on the painted world
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (离得近 / 喊 / 房间) + `godot/docs/ART.md`
**Requirement**: `TR-pair-001`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Play shows both cover-coats on `bed-valley.png` from one snap (pair distance / 身旁)
- [ ] 喊 lights the other coat; no second indoor HUD
- [ ] Away body stays on the painted world; room code stays; back sits the same seat
- [ ] Wild fog paints partner-shared `revealed` tiles
- [ ] Thin 做 / 喊 / sit on the ear if missing; mute does not send
- [ ] Play-path proof prints togetherness tokens through `play.tscn`
- [ ] No 魂; no Don't Starve face; no FAIL restick; no look names in `src/`; no two-iPhone gate

## Implementation Notes

Server already has `near`, `mergeExplored`, `reclaim`, and `ping`. Do not move those rules into Godot. Feed two actors through `play.tscn`. Prefer the existing ping glow over a new ring. Thin tones only — do not add a second art language. Two-iPhone playtest stays later.

## Out of Scope

- Two-iPhone human playtest
- Recrop FAIL PNGs
- New pair HUD rings / 魂
- Look names in `src/`

## QA Test Cases

- **AC-1**: Play shows a shared valley without a second phone
  - Setup: `play_together.tscn` feeds a two-coat snap, a mate shout, an away/back seat, then a wild share
  - Verify: both coats, other glow, room kept, partner revealed, thin ear
  - Pass condition: `PLAY_TOGETHER_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_together.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-two-players, r1-move-do-shout, r1-room
- Unlocks: later two-iPhone playtest (not this slice)
