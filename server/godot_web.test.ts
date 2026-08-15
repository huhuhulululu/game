import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { godotFilePath, isLegacyPath, mimeFor, prepareLegacyUrl } from "./godot_web";

test("Godot web routes stay on the painted export", () => {
  const root = join(tmpdir(), `valley-godot-web-${process.pid}`);
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "index.html"), "<html>并肩山谷</html>");
  writeFileSync(join(root, "index.wasm"), "wasm");
  assert.equal(godotFilePath("/", root), join(root, "index.html"));
  assert.equal(godotFilePath("/index.wasm", root), join(root, "index.wasm"));
  assert.equal(godotFilePath("/../package.json", root), null);
  assert.equal(mimeFor("index.wasm"), "application/wasm");
  assert.equal(mimeFor("index.pck"), "application/octet-stream");
  assert.ok(isLegacyPath("/legacy"));
  assert.ok(isLegacyPath("/src/main.ts"));
  assert.equal(isLegacyPath("/"), false);
  assert.equal(prepareLegacyUrl("/legacy"), "/");
});
