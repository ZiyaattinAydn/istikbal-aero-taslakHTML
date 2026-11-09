import { spawn } from "node:child_process";
// Accept the host/port flags used by generic preview launchers as well as Next's flags.
const incoming = process.argv.slice(2);
const args = [];
for (const arg of incoming) {
  if (arg === "--strictPort") continue; // Next already fails when its requested port is occupied.
  args.push(arg === "--host" ? "--hostname" : arg);
}
if (!args.includes("--hostname") && !args.includes("-H"))
  args.push("--hostname", "0.0.0.0");
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", ...args],
  { stdio: "inherit" },
);
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
child.on("exit", (code) => process.exit(code ?? 1));
