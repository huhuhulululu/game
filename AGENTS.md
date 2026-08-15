# AGENTS.md

## Cursor Cloud specific instructions

`并肩山谷` (jianbang-valley) is a single-service, two-player couch co-op web game. There is no separate frontend/backend split: one Node process (`server/index.ts`, run via `tsx`) hosts both the Vite dev middleware (serving the browser client from `src/`) and a WebSocket game server at `/ws`. All game simulation runs server-side in `src/sim/world.ts`; clients send input over the socket and render snapshots.

- Run the dev server: `npm run dev` (listens on `0.0.0.0:5173`, serves the app and the `/ws` socket from the same port). This is the only long-running service.
- Tests: `npm test` (Node's built-in test runner over `src/game/systems.test.ts`).
- Build/typecheck: `npm run build` (`tsc --noEmit && vite build`). Use this for type checking; there is no separate lint step / ESLint config in this repo.
- Entry flow in the client is `boot → setup → room → play`. To reach gameplay: click through the intro, enter a name, then click "开一间" (create a room) which immediately drops you into the valley (`play` scene). "进去" joins an existing room by 4-char code. A room holds at most two players.
- The game is designed for touch (two iPhones). On desktop use WASD/arrow keys to move, Space to interact ("做"), and H to shout ("喊").
