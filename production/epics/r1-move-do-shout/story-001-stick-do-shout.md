# Story 001: Stick, 做, 喊

> **Epic**: Move / do / shout
> **Status**: Ready
> **Layer**: Core
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-play-001`
**ADR Governing Implementation**: ADR-0002

## Acceptance Criteria

- [ ] Play sends move / act / held / ping through `Net.send_input`
- [ ] HUD has 做 and 喊 wood buttons
- [ ] Camera clamps to the valley bed size
- [ ] Shout still paints a ping on the other body

## Implementation Notes

Keep input in `play.gd`. After the packed-scene swap, camera must still call `ValleyWorld.size_px()`.

## Out of Scope

- Rewriting Net

## QA Test Cases

- Tests lock `_clamp_cam`, 做 / 喊, `send_input`, mate ping

## Test Evidence

`godot/project.test.ts`
**Status**: [x] P0 — re-verify after scene swap

## Dependencies

- Depends on: r1-painted-valley
- Unlocks: r1-first-evening
