# Epic: Evening places look

> **Layer**: Feature
> **GDD**: `docs/WORLD.md` + `godot/docs/ART.md`
> **Architecture Module**: ZoneMap + ValleyLogic + Play
> **Status**: Complete
> **Governing ADRs**: ADR-0003

## Overview

First-evening rules already work. Kitchen, mine, forge, stall, and sleep still read as a second language (ink stickers, tiled wallpaper). Same painted dusk as the valley bed.

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-0003 | One painted dusk language; cover is the title lock | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-look-006 | Kitchen / mine / forge / stall / sleep, one dusk language | ADR-0003 ✅ |

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Kitchen bed | Visual/Feel | Complete | ADR-0003 |
| 002 | Mine bed | Visual/Feel | Complete | ADR-0003 |
| 003 | Forge and stall | Visual/Feel | Complete | ADR-0003 |
| 004 | Sleep | Visual/Feel | Complete | ADR-0003 |
