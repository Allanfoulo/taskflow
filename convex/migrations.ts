import { mutation } from "./_generated/server";
import { v } from "convex/values";

const notificationSettingsValidator = v.object({
  emailNotifications: v.boolean(),
  pushNotifications: v.boolean(),
  weeklyDigest: v.boolean(),
  mentionAlerts: v.boolean(),
  taskReminders: v.boolean(),
});

const accountSettingsValidator = v.object({
  language: v.string(),
  timezone: v.string(),
  dateFormat: v.string(),
  timeFormat: v.string(),
});

const milestoneValidator = v.object({
  id: v.string(),
  title: v.string(),
  date: v.string(),
  completed: v.boolean(),
});

const subtaskValidator = v.object({
  id: v.string(),
  title: v.string(),
  completed: v.boolean(),
});

const metadataValidator = v.optional(
  v.object({
    projectId: v.optional(v.string()),
    taskId: v.optional(v.string()),
  }),
);

async function upsertUserByEmail(
  ctx: any,
  user: {
    email: string;
    name: string;
    avatarUrl?: string;
  },
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", user.email))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      email: user.email,
      name: user.name,
      image: user.avatarUrl,
      emailVerificationTime: existing.emailVerificationTime ?? Date.now(),
    });
    return existing._id;
  }

  return await ctx.db.insert("users", {
    email: user.email,
    name: user.name,
    image: user.avatarUrl,
    emailVerificationTime: Date.now(),
  });
}

export const importUsers = mutation({
  args: {
    users: v.array(
      v.object({
        email: v.string(),
        name: v.string(),
        avatarUrl: v.optional(v.string()),
        role: v.optional(v.union(v.literal("admin"), v.literal("manager"), v.literal("member"))),
        bio: v.optional(v.string()),
        location: v.optional(v.string()),
        preferences: v.optional(
          v.object({
            account: v.optional(accountSettingsValidator),
            notifications: v.optional(notificationSettingsValidator),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;

    for (const user of args.users) {
      const userId = await upsertUserByEmail(ctx, user);
      const existingProfile = await ctx.db
        .query("profiles")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .unique();

      const profilePatch = {
        userId,
        fullName: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role ?? "member",
        bio: user.bio,
        location: user.location,
        preferences: user.preferences,
      };

      if (existingProfile) {
        await ctx.db.patch(existingProfile._id, profilePatch);
      } else {
        await ctx.db.insert("profiles", profilePatch);
      }

      imported += 1;
    }

    return { imported };
  },
});

export const importWorkspaces = mutation({
  args: {
    workspaces: v.array(
      v.object({
        legacySupabaseId: v.string(),
        name: v.string(),
        color: v.string(),
        ownerEmail: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;

    for (const workspace of args.workspaces) {
      const ownerId = await upsertUserByEmail(ctx, {
        email: workspace.ownerEmail,
        name: workspace.ownerEmail.split("@")[0] || "User",
      });
      const existingWorkspace = await ctx.db
        .query("workspaces")
        .withIndex("legacySupabaseId", (q: any) => q.eq("legacySupabaseId", workspace.legacySupabaseId))
        .unique();

      const patch = {
        legacySupabaseId: workspace.legacySupabaseId,
        name: workspace.name,
        color: workspace.color,
        ownerId,
      };

      if (existingWorkspace) {
        await ctx.db.patch(existingWorkspace._id, patch);
      } else {
        await ctx.db.insert("workspaces", patch);
      }

      imported += 1;
    }

    return { imported };
  },
});

export const importProjects = mutation({
  args: {
    projects: v.array(
      v.object({
        legacySupabaseId: v.string(),
        workspaceLegacySupabaseId: v.string(),
        ownerEmail: v.string(),
        name: v.string(),
        description: v.string(),
        dueDate: v.optional(v.string()),
        status: v.union(v.literal("active"), v.literal("completed"), v.literal("onHold")),
        progress: v.number(),
        members: v.array(v.string()),
        favorite: v.boolean(),
        color: v.string(),
        tags: v.array(v.string()),
        milestones: v.array(milestoneValidator),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;

    for (const project of args.projects) {
      const ownerId = await upsertUserByEmail(ctx, {
        email: project.ownerEmail,
        name: project.ownerEmail.split("@")[0] || "User",
      });
      const workspace = await ctx.db
        .query("workspaces")
        .withIndex("legacySupabaseId", (q: any) =>
          q.eq("legacySupabaseId", project.workspaceLegacySupabaseId),
        )
        .unique();

      if (!workspace) {
        throw new Error(`Missing workspace for project ${project.legacySupabaseId}`);
      }

      const existingProject = await ctx.db
        .query("projects")
        .withIndex("legacySupabaseId", (q: any) => q.eq("legacySupabaseId", project.legacySupabaseId))
        .unique();

      const patch = {
        legacySupabaseId: project.legacySupabaseId,
        ownerId,
        workspaceId: workspace._id,
        name: project.name,
        description: project.description,
        dueDate: project.dueDate,
        status: project.status,
        progress: project.progress,
        members: project.members,
        favorite: project.favorite,
        color: project.color,
        tags: project.tags,
        milestones: project.milestones,
      };

      if (existingProject) {
        await ctx.db.patch(existingProject._id, patch);
      } else {
        await ctx.db.insert("projects", patch);
      }

      imported += 1;
    }

    return { imported };
  },
});

export const importTasks = mutation({
  args: {
    tasks: v.array(
      v.object({
        legacySupabaseId: v.string(),
        projectLegacySupabaseId: v.string(),
        ownerEmail: v.string(),
        assigneeEmail: v.optional(v.string()),
        title: v.string(),
        description: v.string(),
        status: v.union(
          v.literal("backlog"),
          v.literal("todo"),
          v.literal("inProgress"),
          v.literal("inReview"),
          v.literal("done"),
        ),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
        dueDate: v.optional(v.string()),
        tags: v.array(v.string()),
        subtasks: v.array(subtaskValidator),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;

    for (const task of args.tasks) {
      const ownerId = await upsertUserByEmail(ctx, {
        email: task.ownerEmail,
        name: task.ownerEmail.split("@")[0] || "User",
      });
      const assigneeId = task.assigneeEmail
        ? await upsertUserByEmail(ctx, {
            email: task.assigneeEmail,
            name: task.assigneeEmail.split("@")[0] || "User",
          })
        : undefined;
      const project = await ctx.db
        .query("projects")
        .withIndex("legacySupabaseId", (q: any) =>
          q.eq("legacySupabaseId", task.projectLegacySupabaseId),
        )
        .unique();

      if (!project) {
        throw new Error(`Missing project for task ${task.legacySupabaseId}`);
      }

      const existingTask = await ctx.db
        .query("tasks")
        .withIndex("legacySupabaseId", (q: any) => q.eq("legacySupabaseId", task.legacySupabaseId))
        .unique();

      const patch = {
        legacySupabaseId: task.legacySupabaseId,
        ownerId,
        projectId: project._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId,
        dueDate: task.dueDate,
        tags: task.tags,
        subtasks: task.subtasks,
      };

      if (existingTask) {
        await ctx.db.patch(existingTask._id, patch);
      } else {
        await ctx.db.insert("tasks", patch);
      }

      imported += 1;
    }

    return { imported };
  },
});

export const importActivities = mutation({
  args: {
    activities: v.array(
      v.object({
        legacySupabaseId: v.string(),
        userEmail: v.string(),
        action: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        entityName: v.optional(v.string()),
        metadata: metadataValidator,
      }),
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;

    for (const activity of args.activities) {
      const userId = await upsertUserByEmail(ctx, {
        email: activity.userEmail,
        name: activity.userEmail.split("@")[0] || "User",
      });
      const existingActivity = await ctx.db
        .query("activities")
        .withIndex("legacySupabaseId", (q: any) =>
          q.eq("legacySupabaseId", activity.legacySupabaseId),
        )
        .unique();

      const patch = {
        legacySupabaseId: activity.legacySupabaseId,
        userId,
        action: activity.action,
        entityType: activity.entityType,
        entityId: activity.entityId,
        entityName: activity.entityName,
        metadata: activity.metadata,
      };

      if (existingActivity) {
        await ctx.db.patch(existingActivity._id, patch);
      } else {
        await ctx.db.insert("activities", patch);
      }

      imported += 1;
    }

    return { imported };
  },
});
