# Technical Preferences

<!-- Path D brownfield pin for 并肩山谷. /setup-engine godot 4.4 completed 2026-08-15. Do not switch engine. Do not upgrade to 4.5 / 4.6. -->

## Engine & Language

- **Engine**: Godot 4.4 (editor 4.4.1). HTML5 export first. iOS later from the same Godot project. Do not use Unity. Do not use Unreal. Do not scaffold a second Godot project. Do not upgrade to 4.5 or 4.6.
- **Language**: GDScript
- **Rendering**: 2D CanvasItem, GL Compatibility, linear texture filter (illustration / HD-2D, not nearest 8-bit). `dusk.gdshader` `grade` stays `0.0`. `Look.VALLEY_DUSK = Color(1, 1, 1)`.
- **Physics**: Godot 2D as already used in `godot/`. Do not replace the Node / WebSocket authority sim.

## Input & Platform

- **Target Platforms**: Web / HTML5 first (existing `godot/export/web/`). Two iPhones on the same Wi-Fi. iOS App Store later (P3). Desktop is debug.
- **Input Methods**: Touch (virtual stick + 做 / 喊), Keyboard (WASD / arrows, Space/J, H)
- **Primary Input**: Touch (two phones)
- **Gamepad Support**: None
- **Touch Support**: Full
- **Platform Notes**: One person per phone. Do not split one screen into two control sets. Root URL is Godot HTML5; Vite canvas is `/legacy` only.

## Naming Conventions

- **Classes**: PascalCase (e.g., `ValleyWorld`)
- **Variables**: snake_case (e.g., `move_speed`)
- **Signals/Events**: snake_case past tense (e.g., `health_changed`)
- **Files**: snake_case matching script (e.g., `valley_world.gd`)
- **Scenes/Prefabs**: `main.tscn`, `play.tscn`, `valley.tscn`, `cover_loop.tscn`
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_HEALTH`)

## Performance Budgets

- **Target Framerate**: 60 fps on HTML5
- **Frame Budget**: 16.6 ms
- **Draw Calls**: Keep the valley as one painted dusk language; do not stamp extra prop languages
- **Memory Ceiling**: Cover `cover-valley.png` is 1280×720 RGB, read-only

## Testing

- **Framework**: Node `tsx --test` via `npm test` (`src/game/systems.test.ts`, `src/scenes/look.test.ts`, `godot/project.test.ts`, `server/godot_web.test.ts`)
- **Minimum Coverage**: Keep the existing suite green (110 tests as of this pin)
- **Required Tests**: Pair rules, look locks, Godot project/HTML5 smoke. Do not drop CHARTER string locks. If Godot `--import` rewrites `project.godot` features to 4.4, restore the committed `"4.3"` features string.

## Forbidden Patterns

- 精神值 / 魂 / sanity HUD or a "spirit" meter
- Don't Starve face, 饥荒 pen stroke, or pixel outline as the look
- Orange grade filter on the valley (`dusk.gdshader` `grade` ≠ 0, or `Look.VALLEY_DUSK` other than white)
- Stall, anvil, or pixel-ball trees on the valley play floor
- PNG sticker crops: cutting trees/houses from `cover-valley.png` and pasting them back as boxes
- Adding look / art polish in `src/` (TypeScript is reference only)
- Overwriting `godot/`, `server/`, `src/`, `docs/WORLD.md`, `docs/CHARTER.md`
- Running `/brainstorm`, scaffolding a second Godot project, or adding a sample game
- Unity or Unreal as the engine
- Capacitor / wrapping the web build as the iOS ship path
- Spreading Overcooked outside the kitchen rush
- Daily watering chores or mobile check-in as the spine

## Allowed Libraries / Addons

- Node `ws` (room server)
- `tsx` / `typescript` / `vite` (server, reference TS, `/legacy`)
- Godot 4.4 import system and existing `godot/` shaders

## Architecture Decisions Log

- Playable client is Godot 4.4 HTML5 in `godot/`. Authority simulation stays Node / WebSocket in `server/` + `src/sim/`.
- TypeScript in `src/` is the systems/copy reference. Do not add look there.
- Cover `godot/assets/art/cover-valley.png` is read-only.
- CCGS is vendored under `.claude/` with a Cursor copy under `.cursor/skills/`. Unity/Unreal specialist agents were dropped.

## Engine Specialists

- **Primary**: godot-specialist
- **Language/Code Specialist**: godot-gdscript-specialist (all .gd files)
- **Shader Specialist**: godot-shader-specialist (.gdshader files, VisualShader resources)
- **UI Specialist**: godot-specialist (no dedicated UI specialist — primary covers all UI)
- **Additional Specialists**: godot-gdextension-specialist (native bindings only; not a project language). `godot-csharp-specialist` is present but unused — this project is GDScript only.
- **Routing Notes**: Invoke primary for architecture decisions and cross-cutting review. Invoke GDScript specialist for .gd quality and signals. Invoke shader specialist for `dusk.gdshader` / `air.gdshader`. Do not spawn Unity or Unreal specialists (they are not in this tree).

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.gd files) | godot-gdscript-specialist |
| Shader / material files (.gdshader, VisualShader) | godot-shader-specialist |
| UI / screen files (Control nodes, CanvasLayer) | godot-specialist |
| Scene / prefab / level files (.tscn, .tres) | godot-specialist |
| Native extension / plugin files (.gdextension, C++) | godot-gdextension-specialist |
| TypeScript reference (`src/`, `server/`) | lead-programmer (do not add look) |
| General architecture review | godot-specialist / technical-director |
