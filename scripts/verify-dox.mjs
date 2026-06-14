import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredDocs = [
  "AGENTS.md",
  ".agent/AGENTS.md",
  "public/AGENTS.md",
  "scripts/AGENTS.md",
  "src/AGENTS.md",
  "src/components/AGENTS.md",
  "src/components/ai/AGENTS.md",
  "src/components/analytics/AGENTS.md",
  "src/components/auth/AGENTS.md",
  "src/components/collaboration/AGENTS.md",
  "src/components/dashboard/AGENTS.md",
  "src/components/integrations/AGENTS.md",
  "src/components/layout/AGENTS.md",
  "src/components/projects/AGENTS.md",
  "src/components/tasks/AGENTS.md",
  "src/components/ui/AGENTS.md",
  "src/components/user/AGENTS.md",
  "src/contexts/AGENTS.md",
  "src/hooks/AGENTS.md",
  "src/lib/AGENTS.md",
  "src/pages/AGENTS.md",
  "src/pages/auth/AGENTS.md",
  "src/pages/calendar/AGENTS.md",
  "src/pages/collaboration/AGENTS.md",
  "src/pages/integrations/AGENTS.md",
  "src/pages/notifications/AGENTS.md",
  "src/pages/profile/AGENTS.md",
  "src/pages/projects/AGENTS.md",
  "src/pages/settings/AGENTS.md",
  "src/pages/tasks/AGENTS.md",
  "src/pages/team/AGENTS.md",
  "src/styles/AGENTS.md",
];

const missing = [];

for (const relativePath of requiredDocs) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length > 0) {
  console.error("DOX check failed. Missing AGENTS.md files:");
  for (const relativePath of missing) {
    console.error(`- ${relativePath}`);
  }
  process.exitCode = 1;
} else {
  console.log("DOX check passed.");
}

console.log("Reminder: after meaningful changes, re-read the DOX chain for edited paths and update the nearest owning AGENTS.md when contracts or structure changed.");
