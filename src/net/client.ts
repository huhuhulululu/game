import type { ClientMsg, ServerMsg, WorldSnap } from "../sim/net";

export function wsUrl(): string {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}/ws`;
}

export function connectRoom(
  room: string,
  name: string,
  prefer: "left" | "right" | "",
  onSnap: (snap: WorldSnap) => void,
  onErr: (text: string) => void,
): { send: (msg: ClientMsg) => void; close: () => void } {
  const sock = new WebSocket(wsUrl());
  const send = (msg: ClientMsg) => {
    if (sock.readyState === WebSocket.OPEN) sock.send(JSON.stringify(msg));
  };
  sock.addEventListener("open", () => {
    send({ t: "hello", room, name, prefer: prefer || undefined });
  });
  sock.addEventListener("message", (ev) => {
    const msg = JSON.parse(String(ev.data)) as ServerMsg;
    if (msg.t === "snap") onSnap(msg.snap);
    if (msg.t === "err") onErr(msg.text);
  });
  sock.addEventListener("close", () => onErr("连接断开了"));
  return { send, close: () => sock.close() };
}
