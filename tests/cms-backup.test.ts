import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("media archive detects incomplete, missing, modified and traversal files; keeps private modes", async () => {
  const { backupMedia, verifyMedia } = await import("../scripts/cms/" + "media-backup.mjs");
  const root = await mkdtemp(join(tmpdir(), "cms-backup-test-"));
  const path = "00000000-0000-0000-0000-000000000001/00000000-0000-0000-0000-000000000002.webp";
  const bytes = Buffer.from("isolated fixture bytes");
  const client = {
    storage: { from: () => ({
      list: async (prefix: string) => ({ error: null, data: prefix
        ? [{ id: "fixture", name: path.split("/")[1], updated_at: "fixed", metadata: { size: bytes.length } }]
        : [{ name: path.split("/")[0], id: null }] }),
      download: async () => ({ error: null, data: new Blob([bytes]) }),
    }) },
    from: () => ({ select: () => ({ order: () => ({ range: async () => ({
      error: null, data: [{ id: "fixture", path, alt: "Fixture", visibility: "private" }],
    }) }) }) }),
  };
  try {
    const archive = join(root, "archive");
    const manifest = await backupMedia(client, archive, "fixture");
    assert.equal(manifest.files.length, 1);
    assert.equal((await stat(archive)).mode & 0o777, 0o700);
    assert.equal((await stat(join(archive, path))).mode & 0o777, 0o600);
    await assert.rejects(() => backupMedia(client, archive), /EEXIST/);
    await assert.rejects(() => backupMedia(client, join(root, "over-budget"), "fixture", 0));
    await assert.rejects(() => verifyMedia(join(root, "over-budget")));
    const original = await readFile(join(archive, path));
    await writeFile(join(archive, path), Buffer.alloc(original.length, 42));
    await assert.rejects(() => verifyMedia(archive));
    await rm(join(archive, path));
    await assert.rejects(() => verifyMedia(archive));
    await writeFile(join(archive, path), original);
    manifest.files[0].path = "../outside.webp";
    await writeFile(join(archive, "manifest.json"), JSON.stringify(manifest));
    await assert.rejects(() => verifyMedia(archive));
    await rm(join(archive, "manifest.json"));
    await assert.rejects(() => verifyMedia(archive));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
