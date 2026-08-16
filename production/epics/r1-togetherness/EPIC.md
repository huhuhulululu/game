# Epic: Togetherness on the painted world

> **Layer**: Feature
> **GDD**: `docs/WORLD.md` + `godot/docs/ART.md`
> **Architecture Module**: Play + Net + ValleyEar
> **Status**: In progress
> **Governing ADRs**: ADR-0002

## Overview

Shared vision, pair distance, shout, and room reclaim already live on the Node server. Pair-fish and dual 做 stay server rules. Godot shows them as two coats. Two-iPhone playtest is a Blocked human story — do not `/dev-story` it.

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-0002 | Authority stays Node / ws. Play only consumes the snap. | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-pair-001 | Two phones must affect each other (pair fish / near / shout / sleep) | ADR-0002 ✅ |

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Shared valley | Integration | Complete | ADR-0002 |
| 002 | Pair hands | Integration | Complete | ADR-0002 |
| 003 | Two-phone playtest | Integration | Blocked (human) | ADR-0002 |
