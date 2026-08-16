# Epic: Room code

> **Layer**: Foundation
> **GDD**: `docs/WORLD.md`
> **Architecture Module**: Net + room
> **Status**: Complete
> **Governing ADRs**: ADR-0002

## Overview

One person opens a room. The other types the four-digit code. Everyday names. Wood plaque on the cover. P0 already ships this.

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-0002 | Node/ws client stays | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-net-001 | Two phones, one room code | ADR-0002 ✅ |
| TR-net-002 | Authority stays on the server | ADR-0002 ✅ |

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Open / join room | Integration | Complete | ADR-0002 |
