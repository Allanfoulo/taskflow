import fs from "node:fs";
import path from "node:path";

function printUsage() {
  console.log(
    [
      "Usage: node scripts/prepare-supabase-export.mjs --input-dir <dir> [--output <file>]",
      "   or: node scripts/prepare-supabase-export.mjs --sql-backup <file> [--output <file>]",
      "",
      "Expected files inside <dir> for full app-data migration:",
      "  users.json",
      "  profiles.json",
      "  workspaces.json",
      "  projects.json",
      "  tasks.json",
      "  activities.json",
      "",
      "For identity-only recovery from a Supabase SQL dump, pass --sql-backup.",
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

function loadJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === "object") {
    const arrayValue = Object.values(parsed).find(Array.isArray);
    if (Array.isArray(arrayValue)) {
      return arrayValue;
    }
  }
  throw new Error(`Expected an array in ${filePath}`);
}

function decodePostgresCopyValue(value) {
  if (value === "\\N") {
    return null;
  }

  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r");
}

function parseCopySection(sql, marker) {
  const startIndex = sql.indexOf(marker);
  if (startIndex === -1) {
    return [];
  }

  const bodyStart = startIndex + marker.length;
  const bodyEnd = sql.indexOf("\n\\.\n", bodyStart);
  if (bodyEnd === -1) {
    throw new Error(`Could not find end of COPY section for marker: ${marker}`);
  }

  const body = sql.slice(bodyStart, bodyEnd).trim();
  if (!body) {
    return [];
  }

  return body
    .split("\n")
    .map((line) => line.split("\t").map(decodePostgresCopyValue));
}

function normalizeRole(value) {
  return value === "admin" || value === "manager" || value === "member"
    ? value
    : "member";
}

function normalizeProjectStatus(value) {
  return value === "completed" || value === "onHold" ? value : "active";
}

function normalizeTaskStatus(value) {
  return ["backlog", "todo", "inProgress", "inReview", "done"].includes(value)
    ? value
    : "todo";
}

function normalizeTaskPriority(value) {
  return ["low", "medium", "high", "urgent"].includes(value) ? value : "medium";
}

function withDefaultAccountPreferences(value = {}) {
  return {
    language: value.language || "English",
    timezone: value.timezone || "Pacific Time (UTC-7)",
    dateFormat: value.dateFormat || "MM/DD/YYYY",
    timeFormat: value.timeFormat || "12-hour",
  };
}

function withDefaultNotificationPreferences(value = {}) {
  return {
    emailNotifications: value.emailNotifications ?? true,
    pushNotifications: value.pushNotifications ?? true,
    weeklyDigest: value.weeklyDigest ?? true,
    mentionAlerts: value.mentionAlerts ?? true,
    taskReminders: value.taskReminders ?? true,
  };
}

const args = readArgs(process.argv.slice(2));
if (
  args.has("--help") ||
  (!args.has("--input-dir") && !args.has("--sql-backup"))
) {
  printUsage();
  process.exit(args.has("--help") ? 0 : 1);
}

let outputBaseDir = process.cwd();
let normalizedUsers = [];
let normalizedWorkspaces = [];
let normalizedProjects = [];
let normalizedTasks = [];
let normalizedActivities = [];

if (args.has("--sql-backup")) {
  const sqlBackupPath = path.resolve(args.get("--sql-backup"));
  outputBaseDir = path.dirname(sqlBackupPath);
  const sql = fs.readFileSync(sqlBackupPath, "utf8");
  const authUsersRows = parseCopySection(
    sql,
    "COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;\n",
  );

  normalizedUsers = authUsersRows
    .map((row) => {
      const email = row[4] ? String(row[4]).trim().toLowerCase() : "";
      if (!email) {
        return null;
      }

      let rawUserMetaData = {};
      try {
        rawUserMetaData = row[17] ? JSON.parse(row[17]) : {};
      } catch {
        rawUserMetaData = {};
      }

      const name =
        String(rawUserMetaData.name || "").trim() ||
        email.split("@")[0] ||
        "User";

      return {
        email,
        name,
        avatarUrl: rawUserMetaData.avatar_url || "",
        role: "member",
        bio: "",
        location: "",
        preferences: {
          account: withDefaultAccountPreferences(),
          notifications: withDefaultNotificationPreferences(),
        },
      };
    })
    .filter(Boolean);
} else {
  const inputDir = path.resolve(args.get("--input-dir"));
  outputBaseDir = inputDir;

  const users = loadJsonFile(path.join(inputDir, "users.json"));
  const profiles = loadJsonFile(path.join(inputDir, "profiles.json"));
  const workspaces = loadJsonFile(path.join(inputDir, "workspaces.json"));
  const projects = loadJsonFile(path.join(inputDir, "projects.json"));
  const tasks = loadJsonFile(path.join(inputDir, "tasks.json"));
  const activities = loadJsonFile(path.join(inputDir, "activities.json"));

  const usersById = new Map(
    users
      .filter((user) => typeof user.email === "string" && user.email.length > 0)
      .map((user) => [
        user.id,
        {
          id: user.id,
          email: String(user.email).trim().toLowerCase(),
          name:
            String(user.raw_user_meta_data?.name || user.user_metadata?.name || "")
              .trim() ||
            String(user.email).split("@")[0] ||
            "User",
          avatarUrl:
            user.raw_user_meta_data?.avatar_url ||
            user.user_metadata?.avatar_url ||
            "",
        },
      ]),
  );

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  normalizedUsers = Array.from(usersById.values()).map((user) => {
    const profile = profilesById.get(user.id);
    const preferences = profile?.preferences || {};
    return {
      email: user.email,
      name: profile?.full_name || user.name,
      avatarUrl: profile?.avatar_url || user.avatarUrl || "",
      role: normalizeRole(profile?.role),
      bio: profile?.bio || "",
      location: profile?.location || "",
      preferences: {
        account: withDefaultAccountPreferences(preferences.account),
        notifications: withDefaultNotificationPreferences(preferences.notifications),
      },
    };
  });

  normalizedWorkspaces = workspaces
    .map((workspace) => {
      const owner = usersById.get(workspace.owner_id);
      if (!owner) {
        return null;
      }
      return {
        legacySupabaseId: String(workspace.id),
        name: workspace.name || "Workspace",
        color: workspace.color || "#4f46e5",
        ownerEmail: owner.email,
      };
    })
    .filter(Boolean);

  normalizedProjects = projects
    .map((project) => {
      const owner = usersById.get(project.owner_id);
      if (!owner || !project.workspace_id) {
        return null;
      }
      return {
        legacySupabaseId: String(project.id),
        workspaceLegacySupabaseId: String(project.workspace_id),
        ownerEmail: owner.email,
        name: project.name || "Untitled Project",
        description: project.description || "",
        dueDate: project.due_date || undefined,
        status: normalizeProjectStatus(project.status),
        progress: typeof project.progress === "number" ? project.progress : 0,
        members: Array.isArray(project.members) ? project.members.map(String) : [],
        favorite: Boolean(project.favorite),
        color: project.color || "#4f46e5",
        tags: Array.isArray(project.tags) ? project.tags.map(String) : [],
        milestones: Array.isArray(project.milestones)
          ? project.milestones.map((milestone) => ({
              id: String(milestone.id),
              title: String(milestone.title || "Milestone"),
              date: String(milestone.date || ""),
              completed: Boolean(milestone.completed),
            }))
          : [],
      };
    })
    .filter(Boolean);

  normalizedTasks = tasks
    .map((task) => {
      const project = projects.find((candidate) => candidate.id === task.project_id);
      const owner = project ? usersById.get(project.owner_id) : null;
      if (!project || !owner) {
        return null;
      }
      const assignee = task.assignee_id ? usersById.get(task.assignee_id) : null;
      return {
        legacySupabaseId: String(task.id),
        projectLegacySupabaseId: String(task.project_id),
        ownerEmail: owner.email,
        assigneeEmail: assignee?.email,
        title: task.title || "Untitled Task",
        description: task.description || "",
        status: normalizeTaskStatus(task.status),
        priority: normalizeTaskPriority(task.priority),
        dueDate: task.due_date || undefined,
        tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
        subtasks: Array.isArray(task.subtasks)
          ? task.subtasks.map((subtask) => ({
              id: String(subtask.id),
              title: String(subtask.title || "Subtask"),
              completed: Boolean(subtask.completed),
            }))
          : [],
      };
    })
    .filter(Boolean);

  normalizedActivities = activities
    .map((activity) => {
      const user = usersById.get(activity.user_id);
      if (!user) {
        return null;
      }
      return {
        legacySupabaseId: String(activity.id),
        userEmail: user.email,
        action: String(activity.action || "updated"),
        entityType: String(activity.entity_type || "unknown"),
        entityId: String(activity.entity_id || ""),
        entityName:
          activity.entity_name === null || activity.entity_name === undefined
            ? undefined
            : String(activity.entity_name),
        metadata:
          activity.metadata && typeof activity.metadata === "object"
            ? {
                projectId:
                  activity.metadata.projectId === undefined
                    ? undefined
                    : String(activity.metadata.projectId),
                taskId:
                  activity.metadata.taskId === undefined
                    ? undefined
                    : String(activity.metadata.taskId),
              }
            : undefined,
      };
    })
    .filter(Boolean);
}

const outputFile = path.resolve(
  args.get("--output") || path.join(outputBaseDir, "convex-import.json"),
);

const snapshot = {
  meta: {
    generatedAt: new Date().toISOString(),
    source: args.has("--sql-backup") ? "supabase-sql-backup" : "supabase",
    counts: {
      users: normalizedUsers.length,
      workspaces: normalizedWorkspaces.length,
      projects: normalizedProjects.length,
      tasks: normalizedTasks.length,
      activities: normalizedActivities.length,
    },
  },
  users: normalizedUsers,
  workspaces: normalizedWorkspaces,
  projects: normalizedProjects,
  tasks: normalizedTasks,
  activities: normalizedActivities,
};

fs.writeFileSync(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Prepared Convex import snapshot at ${outputFile}`);
console.log(JSON.stringify(snapshot.meta.counts, null, 2));
