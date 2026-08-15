# Evidence — stick, 做, 喊

*Story: `production/epics/r1-move-do-shout/story-001-stick-do-shout.md`*
*Date: 2026-08-15*
*Type: Integration*

## What stayed after the packed-bed swap

- `play.gd` `_process` → `Net.send_input(v.x, v.y, _act, _held, _ping)`
- Wood buttons `做` / `喊` (plus `声` mute, which does not send)
- `_clamp_cam` uses `_valley.size_px()` on the valley
- Mate shout still drives `ActorView` `ping_glow`

## Sign-off

Re-verified on the painted bed. Brainbird enter HUD still shows the wood plaque / 做 喊 声 stack. Tests lock the wires.
