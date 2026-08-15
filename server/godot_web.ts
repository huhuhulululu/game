import { createReadStream, existsSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const GODOT_WEB_DIR = resolve(fileURLToPath(new URL("../godot/export/web", import.meta.url)));

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".wasm": "application/wasm",
  ".pck": "application/octet-stream",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
};

export function isLegacyPath(pathname: string): boolean {
  return (
    pathname === "/legacy" ||
    pathname.startsWith("/legacy/") ||
    pathname.startsWith("/src/") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/node_modules/")
  );
}

export function prepareLegacyUrl(url: string): string {
  if (url === "/legacy" || url === "/legacy/") return "/";
  if (url.startsWith("/legacy?")) return `/${url.slice("/legacy".length)}`;
  return url;
}

export function godotFilePath(urlPath: string, root = GODOT_WEB_DIR): string | null {
  let rel = decodeURIComponent((urlPath.split("?")[0] ?? "/") || "/");
  if (rel === "/" || rel === "") rel = "/index.html";
  const full = resolve(root, `.${normalize(`/${rel}`)}`);
  const prefix = root.endsWith(sep) ? root : root + sep;
  if (full !== root && !full.startsWith(prefix)) return null;
  if (!existsSync(full)) return null;
  if (!statSync(full).isFile()) return null;
  return full;
}

export function mimeFor(file: string): string {
  return MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
}

export function serveGodotWeb(req: IncomingMessage, res: ServerResponse, root = GODOT_WEB_DIR): boolean {
  const pathname = new URL(req.url ?? "/", "http://local").pathname;
  const file = godotFilePath(pathname, root);
  if (!file) return false;
  res.setHeader("Content-Type", mimeFor(file));
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  createReadStream(file).pipe(res);
  return true;
}
