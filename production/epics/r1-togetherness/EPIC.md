# Epic: Togetherness on the painted world

> **Layer**: Feature
> **GDD**: `docs/WORLD.md` + `godot/docs/ART.md`
> **Architecture Module**: Play + Net + ValleyEar
> **Status**: Complete
> **Governing ADRs**: ADR-0002

## Overview

Shared vision, pair distance, shout, and room reclaim already live on the Node server. Pair-fish and dual 做 at forge / stall / sleep stay server rules. Godot shows them as two coats on the painted world, not a bonus stat. Two-iPhone playtest is a later human story.

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
