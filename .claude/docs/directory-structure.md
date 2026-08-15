# Directory Structure

**并肩山谷 (Path D):** do not invent a second tree. Playable client is `godot/`. Authority sim is `server/` + `src/sim/`. TypeScript in `src/` is reference only. Art is `godot/assets/art/`. Design authority is `docs/WORLD.md`, `docs/CHARTER.md`, `godot/docs/ART.md`. Studio files are `.claude/` plus a Cursor copy in `.cursor/skills/`. See `CLAUDE.md` and `docs/adoption-plan.md`.

Template default (CCGS), for skill path names only:

```text
/
├── CLAUDE.md                    # Master configuration
├── .claude/                     # Agent definitions, skills, hooks, rules, docs
├── src/                         # Game source code (core, gameplay, ai, networking, ui, tools)
├── assets/                      # Game assets (art, audio, vfx, shaders, data)
├── design/                      # Game design documents (gdd, narrative, levels, balance)
├── docs/                        # Technical documentation (architecture, api, postmortems)
│   └── engine-reference/        # Curated engine API snapshots (version-pinned)
├── tests/                       # Test suites (unit, integration, performance, playtest)
├── tools/                       # Build and pipeline tools (ci, build, asset-pipeline)
├── prototypes/                  # Throwaway prototypes (isolated from src/)
└── production/                  # Production management (sprints, milestones, releases)
    ├── session-state/           # Ephemeral session state (active.md — gitignored)
    └── session-logs/            # Session audit trail (gitignored)
```
