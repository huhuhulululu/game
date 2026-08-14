import type { ClientMsg, ServerMsg, WorldSnap } from "../sim/net";

export function wsUrl(): string {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}/ws`;
}

export function mergeSnap(prev: WorldSnap | null, next: WorldSnap): WorldSnap {
  if (next.full || !prev) return next;
  return {
    ...prev,
    ...next,
    tiles: next.tiles.length ? next.tiles : prev.tiles,
    revealed: next.full ? next.revealed : next.revealed.length ? next.revealed : prev.revealed,
    fires: next.full ? next.fires : prev.fires,
    visible: next.visible,
    bag: next.bag,
    ice: next.ice,
    cookbook: next.cookbook,
    full: false,
  };
}

export function connectRoom(
  room: string,
  name: string,
  prefer: "left" | "right" | "",
  onSnap: (snap: WorldSnap) => void,
  onErr: (text: string) => void,
): { send: (msg: ClientMsg) => void; close: () => void } {
  let sock: WebSocket | null = null;
  let closed = false;
  let last: WorldSnap | null = null;
  let tries = 0;
  const send = (msg: ClientMsg) => {
    if (sock?.readyState === WebSocket.OPEN) sock.send(JSON.stringify(msg));
  };
  const open = () => {
    if (closed) return;
    sock = new WebSocket(wsUrl());
    sock.addEventListener("open", () => {
      tries = 0;
      send({ t: "hello", room, name, prefer: prefer || undefined });
    });
    sock.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data)) as ServerMsg;
      if (msg.t === "snap") {
        last = mergeSnap(last, msg.snap);
        onSnap(last);
      }
      if (msg.t === "err") onErr(msg.text);
    });
    sock.addEventListener("close", () => {
      if (closed) return;
      tries += 1;
      if (tries > 6) {
        onErr("连接断开了");
        return;
      }
      onErr("在重连…");
      setTimeout(open, Math.min(4000, 400 * tries));
    });
  };
  open();
  return {
    send,
    close: () => {
      closed = true;
      sock?.close();
    },
  };
}
