# Godot — Current Best Practices

Last verified: 2026-08-15 | Engine: Godot 4.4.1

Practices for **this** pin. Do not copy 4.5 / 4.6 editor or renderer defaults into `godot/`.

## This project

- **2D CanvasItem**, GL Compatibility, linear texture filter (illustration / HD-2D).
- HTML5 export first. `npm run export:web` writes `godot/export/web/`. Do not re-export unless a hook requires it.
- `dusk.gdshader` `grade` stays `0.0`. `Look.VALLEY_DUSK = Color(1, 1, 1)`.
- Authority sim stays Node / WebSocket. Godot does not `new World`.
- `project.godot` features string stays `"4.3"` (tests lock it) even though the editor is 4.4.1.

## GDScript (4.4)

- Typed variables, `Array[Type]`, `@onready` cached nodes.
- Signals: `signal.connect(callable)` — not string `connect()`.
- `await` — not `yield()`.
- `instantiate()` — not `instance()`.
- Do not use 4.5 `@abstract` or variadic `...` args.

## Shaders (4.4)

- Default texture parameters are `Texture`, not `Texture2D`.
- This project's look shaders are `godot/shaders/dusk.gdshader` and `godot/shaders/air.gdshader`. Do not add a second grade pass.

## Physics

- 2D Godot Physics as already used. Jolt is a 3D option in 4.4, not a default, and not this game.

## Rendering

- Compatibility renderer for HTML5.
- Do not assume D3D12, Shader Baker, SMAA, or 4.6 glow-before-tonemap.

## Tooling

- ripgrep has no `gdscript` type. Use `glob: "*.gd"`.
- If Godot `--import` rewrites `project.godot` features to 4.4, restore the committed `"4.3"` string.

## Platform

- Two iPhones, touch first. Keyboard is debug.
- iOS later from this same Godot project. No Capacitor shell.
