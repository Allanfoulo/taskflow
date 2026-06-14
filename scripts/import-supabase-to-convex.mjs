import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function printUsage() {
  console.log(
    [
      "Usage: node scripts/import-supabase-to-convex.mjs --input <file> [--batch-size <n>]",
      "",
      "Runs batched Convex imports for:",
      "  users",
      "  workspaces",
      "  projects",
      "  tasks",
      "  activities",
    ].join("\n"),
  );
}

function readArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key.startsWith("--")) {
      args.set(key, value);
      index += 1;
    }
  }
  return args;
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

function runConvexImport(functionName, payload) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    executable,
    ["convex", "run", functionName, JSON.stringify(payload)],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
    },
  );

  if (result.status !== 0) {
    throw new Error(`Convex import failed for ${functionName}`);
  }
}

const args = readArgs(process.argv.slice(2));
if (args.has("--help") || !args.has("--input")) {
  printUsage();
  process.exit(args.has("--help") ? 0 : 1);
}

const inputPath = path.resolve(args.get("--input"));
const batchSize = Number.parseInt(args.get("--batch-size") || "50", 10);
const snapshot = JSON.parse(fs.readFileSync(inputPath, "utf8"));

for (const [label, functionName] of [
  ["users", "migrations:importUsers"],
  ["workspaces", "migrations:importWorkspaces"],
  ["projects", "migrations:importProjects"],
  ["tasks", "migrations:importTasks"],
  ["activities", "migrations:importActivities"],
]) {
  const records = Array.isArray(snapshot[label]) ? snapshot[label] : [];
  const batches = chunk(records, batchSize);
  console.log(`Importing ${records.length} ${label} in ${batches.length} batch(es)`);

  for (const batch of batches) {
    runConvexImport(functionName, { [label]: batch });
  }
}

console.log("Convex import complete.");
