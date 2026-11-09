import { spawn } from "node:child_process";
// Serve the existing production build for generic preview tools.
const args = process.argv
  .slice(2)
  .filter((arg) => arg !== "--strictPort")
  .map((arg) => (arg === "--host" ? "--hostname" : arg));
if (!args.includes("--hostname") && !args.includes("-H"))
  args.push("--hostname", "0.0.0.0");
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", ...args],
  { stdio: "inherit" },
);
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
child.on("exit", (code) => process.exit(code ?? 1));
