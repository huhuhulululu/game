# 并肩山谷 (Jianbang Valley)

A two-player, phone-first browser game. A single Node process serves the Vite
frontend and hosts an authoritative game world over WebSockets.

## Cursor Cloud specific instructions

### Architecture (why one command runs everything)
- `npm run dev` runs `tsx server/index.ts`, which boots Vite in middleware mode
  (SPA) and a `ws` `WebSocketServer` on path `/ws`, both on the same port. There
  is **no separate frontend dev server** — do not run `vite` on its own; the
  client connects back to `/ws` on the page's origin.
- The server keeps per-room `World` state in memory and broadcasts snapshots on
  a 50ms tick. Rooms are dropped 10 minutes after the last client leaves.

### Running
- Dev/serve: `npm run dev` (defaults to port 5173; override with `PORT=<n>`).
  Binds `0.0.0.0`, so it is reachable from the browser preview.
- The game is playable solo: on the room screen, set a name and tap `开一间`
  (open a room) then `进去` (enter). A second player joins the same 4-char room
  code, but is not required to render and move in the world.

### Lint / test / build
- Tests: `npm test` (`tsx --test` on `src/game/systems.test.ts`).
- Typecheck + production build: `npm run build` (`tsc --noEmit && vite build`).
  There is no separate lint step; `tsc` with `strict` + `noUnusedLocals` is the
  type/lint gate. `dist/` is git-ignored.

### Notes
- All gameplay logic lives under `src/game`, `src/sim`, and `src/world` and is
  plain TypeScript imported by both the server and client, so tests cover it
  without a browser.
- UI text is Chinese; that is expected, not a rendering bug.
