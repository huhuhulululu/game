import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { createServer as createVite } from "vite";
import type { ClientMsg } from "../src/sim/net";
import { World } from "../src/sim/world";
import { makeRoomCode, resolveHelloRoom, roomIsFull, takeRoom } from "./join";

const PORT = Number(process.env.PORT ?? 5173);
const rooms = new Map<string, { world: World; clients: Map<WebSocket, string>; idle: number }>();

type RoomRec = { world: World; clients: Map<WebSocket, string>; idle: number };

function broadcast(rec: { world: World; clients: Map<WebSocket, string> }, full: boolean) {
  if (full) rec.world.dirty = false;
  for (const [ws, id] of rec.clients) {
    if (ws.readyState !== ws.OPEN) continue;
    ws.send(JSON.stringify({ t: "snap", snap: rec.world.snapshot(id, full) }));
  }
}

const vite = await createVite({
  server: { middlewareMode: true, host: true },
  appType: "spa",
});

const http = createServer((req, res) => {
  vite.middlewares(req, res, () => {
    res.statusCode = 404;
    res.end("not found");
  });
});

const wss = new WebSocketServer({ server: http, path: "/ws" });

wss.on("connection", (ws) => {
  let joined: { room: string; id: string } | null = null;
  ws.on("message", (raw) => {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(String(raw)) as ClientMsg;
    } catch {
      return;
    }
    if (msg.t === "hello") {
      const resolved = resolveHelloRoom(msg.room, rooms, makeRoomCode);
      if ("err" in resolved) {
        ws.send(JSON.stringify({ t: "err", text: resolved.err }));
        return;
      }
      const takenRoom = takeRoom(rooms, resolved, (id) => ({
        world: new World(id),
        clients: new Map(),
        idle: 0,
      }));
      if ("err" in takenRoom) {
        ws.send(JSON.stringify({ t: "err", text: takenRoom.err }));
        return;
      }
      const rec: RoomRec = takenRoom.ok;
      rec.idle = 0;
      const name = msg.name || "过路人";
      const taken = rec.world.reclaim(name, msg.prefer) ?? rec.world.occupyAway(name, msg.prefer);
      if (taken) {
        for (const [oldWs, id] of rec.clients) {
          if (id !== taken) continue;
          rec.clients.delete(oldWs);
          try {
            oldWs.close();
          } catch {
            /* seat taken by reconnect */
          }
        }
        rec.clients.set(ws, taken);
        rec.world.markBack(taken);
        joined = { room: resolved.room, id: taken };
        rec.idle = 0;
        rec.world.dirty = true;
        const seat = rec.world.players.get(taken);
        ws.send(JSON.stringify({ t: "joined", side: seat?.side ?? "left", room: resolved.room }));
        broadcast(rec, true);
        return;
      }
      if (roomIsFull(rec.world.present().length)) {
        ws.send(JSON.stringify({ t: "err", text: "这间山谷已经有两个人了" }));
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const side = rec.world.addPlayer(id, name, msg.prefer);
      if (!side) {
        ws.send(JSON.stringify({ t: "err", text: "这间山谷已经有两个人了" }));
        return;
      }
      rec.clients.set(ws, id);
      joined = { room: resolved.room, id };
      rec.world.dirty = true;
      ws.send(JSON.stringify({ t: "joined", side, room: resolved.room }));
      broadcast(rec, true);
      return;
    }
    if (!joined) return;
    const rec = rooms.get(joined.room);
    if (!rec) return;
    if (msg.t === "input") rec.world.setInput(joined.id, msg);
    if (msg.t === "sleep") rec.world.sleep(joined.id);
    if (msg.t === "take") rec.world.takeItem(msg.id, joined.id);
  });
  ws.on("close", () => {
    if (!joined) return;
    const rec = rooms.get(joined.room);
    if (!rec) return;
    if (!rec.clients.has(ws)) return;
    rec.clients.delete(ws);
    rec.world.markAway(joined.id);
    if (rec.clients.size === 0) rec.idle = Date.now();
    else broadcast(rec, true);
  });
});

let tickN = 0;
setInterval(() => {
  tickN += 1;
  for (const [id, rec] of rooms) {
    if (rec.clients.size === 0) {
      if (rec.idle && Date.now() - rec.idle > 10 * 60 * 1000) rooms.delete(id);
      continue;
    }
    rec.world.tick(0.05);
    const full = rec.world.dirty || tickN % 4 === 0;
    broadcast(rec, full);
  }
}, 50);

http.listen(PORT, "0.0.0.0", () => {
  console.log(`并肩山谷  http://0.0.0.0:${PORT}`);
});
