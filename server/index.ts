import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { createServer as createVite } from "vite";
import type { ClientMsg } from "../src/sim/net";
import { World } from "../src/sim/world";

const PORT = Number(process.env.PORT ?? 5173);
const rooms = new Map<string, { world: World; clients: Map<WebSocket, string> }>();

function code(): string {
  const chars = "ABCDEFGHJKLMNPQRTUVWXY23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function roomOf(id: string) {
  let rec = rooms.get(id);
  if (!rec) {
    rec = { world: new World(id), clients: new Map() };
    rooms.set(id, rec);
  }
  return rec;
}

function broadcast(rec: { world: World; clients: Map<WebSocket, string> }) {
  for (const [ws, id] of rec.clients) {
    if (ws.readyState !== ws.OPEN) continue;
    ws.send(JSON.stringify({ t: "snap", snap: rec.world.snapshot(id) }));
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
      const room = (msg.room || code()).toUpperCase();
      const rec = roomOf(room);
      if (rec.clients.size >= 2) {
        ws.send(JSON.stringify({ t: "err", text: "这间山谷已经有两个人了" }));
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const side = rec.world.addPlayer(id, msg.name || "过路人", msg.prefer);
      rec.clients.set(ws, id);
      joined = { room, id };
      ws.send(JSON.stringify({ t: "joined", side, room }));
      broadcast(rec);
      return;
    }
    if (!joined) return;
    const rec = rooms.get(joined.room);
    if (!rec) return;
    if (msg.t === "input") rec.world.setInput(joined.id, msg);
    if (msg.t === "sleep") rec.world.sleep();
  });
  ws.on("close", () => {
    if (!joined) return;
    const rec = rooms.get(joined.room);
    if (!rec) return;
    rec.world.removePlayer(joined.id);
    rec.clients.delete(ws);
    if (rec.clients.size === 0) rooms.delete(joined.room);
    else broadcast(rec);
  });
});

setInterval(() => {
  for (const rec of rooms.values()) {
    rec.world.tick(0.05);
    broadcast(rec);
  }
}, 50);

http.listen(PORT, "0.0.0.0", () => {
  console.log(`并肩山谷  http://0.0.0.0:${PORT}`);
});
