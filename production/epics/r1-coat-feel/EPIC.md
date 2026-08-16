# Epic: Coat walk and sit feel

> **Layer**: Feature
> **GDD**: `godot/docs/ART.md` + `docs/WORLD.md`
> **Architecture Module**: ActorView
> **Status**: In progress
> **Governing ADRs**: ADR-0003

## Overview

Onboarding, walk / sit, thin ear, and place ear already hold. This pass turns dusk into night on the painted beds. Lamps already in the paint stay the light. Kitchen / mine stay hearth-lit. No new pack.

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-0003 | One painted dusk language; cover is the title lock | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-look-003 | Players are cover-coat people. No Wilson / Don't Starve face. | ADR-0003 ✅ |

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Walk and sit-to-stand | Visual/Feel | Complete | ADR-0003 |
| 002 | Thin audio | Integration | Complete | ADR-0002 |
| 003 | Place ear | Integration | Complete | ADR-0002 |
| 004 | Painted night | Visual/Feel | In progress | ADR-0003 |
