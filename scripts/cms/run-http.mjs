import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
const cwd = process.argv[2],
  target = process.argv[3];
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3110",
  ],
  { cwd, stdio: "ignore" },
);
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch("http://127.0.0.1:3110");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await setTimeout(100);
  }
  if (!ready) throw Error("Server did not start");
  const child = spawn(
    process.execPath,
    ["scripts/cms/http-measure.mjs", "http://127.0.0.1:3110", target],
    { stdio: "inherit" },
  );
  await new Promise((resolve, reject) =>
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error("Measurement failed")),
    ),
  );
  const r = await fetch("http://127.0.0.1:3110/admin");
  console.log(
    "admin status",
    r.status,
    "cache",
    r.headers.get("cache-control"),
  );
} finally {
  server.kill("SIGTERM");
}
