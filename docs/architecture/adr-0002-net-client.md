# ADR-0002: Net client stays Node / WebSocket

## Status

Accepted

## Date

2026-08-15

## Last Verified

2026-08-15

## Decision Makers

Brainbird (custody). Lean Path D rebuild.

## Summary

The rebuild does not move authority into Godot. `Net` autoload and the Node/ws room stay. Two phones still join one four-digit room and share one snap.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Godot 4.4.1 |
| **Domain** | Networking |
| **Knowledge Risk** | LOW — existing `net.gd` + Node `ws` |
| **References Consulted** | `docs/engine-reference/godot/VERSION.md`, CHARTER P2 |
| **Post-Cutoff APIs Used** | None |
| **Verification Required** | Room join + snap still drive play |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None |
| **Enables** | Play rebuild, pair rules |
| **Blocks** | None |
| **Ordering Note** | Do not rewrite the protocol this turn |

## Context

### Problem Statement

A full redesign could tempt a new net stack or Godot multiplayer. CHARTER already pinned Node/ws.

### Current State

`Net` autoload. Server in `server/`. Sim in `src/sim/world.ts` (reference + server).

### Constraints

- Two iPhones, same Wi-Fi
- Disconnect leaves the body; reconnect sits back
- Empty room lasts ten minutes
- Do not add look in `src/`

### Requirements

- Room code
- Shared bag / gold
- Pair actions remain server-side

## Decision

Keep `godot/scripts/net.gd` as the client. Keep the room server. Play only consumes `snap_got`. Do not introduce Godot High-level Multiplayer, a second websocket, or a Unity net layer.

### Architecture

```
play.gd ──send_input/send_take──► Net ──ws──► server/ ── world.ts
play.gd ◄────── snap_got ──────── Net ◄──── snap ─────┘
```

### Implementation Guidelines

- Do not change message shapes unless a test forces it
- Mute / ear must not send
- TypeScript stays reference; no canvas polish

## Alternatives Considered

### Alternative 1: Godot as authority

- **Rejection Reason**: CHARTER P2. Sim already lives on the server.

### Alternative 2: New protocol

- **Rejection Reason**: Out of scope for a look rebuild.

## Consequences

### Positive

- Pair rules and first evening keep working while the valley graph changes

### Negative

- Client cannot invent world state

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Accidental protocol edit | Low | Two phones desync | Leave `net.gd` unless tests fail |

## Performance Implications

Unchanged. Snap rate stays as shipped.

## Migration Plan

None. Retrofit.

**Rollback plan**: n/a

## Validation Criteria

- [ ] `Net` still autoloaded
- [ ] Play still connects `snap_got`
- [ ] CHARTER / pair tests still lock two-phone copy

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| WORLD.md | Two iPhones | Room code, shared snap | Existing Net |
| CHARTER.md | P2 | Node/ws authority | Unchanged |
