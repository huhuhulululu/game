# Epic: Evening places look

> **Layer**: Feature
> **GDD**: `docs/WORLD.md` + `godot/docs/ART.md`
> **Architecture Module**: ZoneMap + ValleyLogic + Play
> **Status**: In progress
> **Governing ADRs**: ADR-0003

## Overview

Kitchen, mine, forge, stall, sleep, spoil / icebox, a campfire pot, painted rain, painted fog, a painted wild path, a lantern-stick, a pair of dusk wells, a silk nest, an old-camp search, a wild stumble, a night bite, the four seasons, and mine floors sit one painted dusk language. Kitchen rush is two coats at the existing stations. Overcooked stays in the kitchen. Wild cook is haul → pot on the fire. Rain and fog sit on the outdoor beds. Unread wild is a dusk wash that lifts as you walk. Held light is a small lantern-stick on the night path. Two earth mouths and one dusk nest sit on the wild bed. Old camp keeps fire and rock; search stays in the snap. Walking unread wild can toast a stumble from the snap. Unlit night wild can toast a bite from the snap. The wood plaque already turns 春夏秋冬; a light paper grade sits on the same painted beds. Mine floor 1 → 2 stays on `bed-mine`; place already says `矿 N层`. Weather look is closed. Wild set pieces and forage stay closed.

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
| 005 | Kitchen rush | Integration | Complete | ADR-0002 |
| 006 | Spoil and icebox | Integration | Complete | ADR-0002 |
| 007 | Campfire pot | Visual/Feel | Complete | ADR-0003 |
| 008 | Painted rain | Visual/Feel | Complete | ADR-0003 |
| 009 | Painted fog | Visual/Feel | Complete | ADR-0003 |
| 010 | Painted path | Visual/Feel | Complete | ADR-0003 |
| 011 | Painted torch | Visual/Feel | Complete | ADR-0003 |
| 012 | Painted wormhole | Visual/Feel | Complete | ADR-0003 |
| 013 | Painted silk | Visual/Feel | Complete | ADR-0003 |
| 014 | Old camp | Integration | Complete | ADR-0002 |
| 015 | Scout find | Integration | Complete | ADR-0002 |
| 016 | Night bite | Integration | Complete | ADR-0002 |
| 017 | Seasons | Visual/Feel | Complete | ADR-0003 |
| 018 | Mine floors | Integration | In progress | ADR-0002 |
