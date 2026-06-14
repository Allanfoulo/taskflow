import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const preferencesValidator = v.object({
  account: v.optional(
    v.object({
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
      dateFormat: v.optional(v.string()),
      timeFormat: v.optional(v.string()),
    }),
  ),
  notifications: v.optional(
    v.object({
      emailNotifications: v.optional(v.boolean()),
      pushNotifications: v.optional(v.boolean()),
      weeklyDigest: v.optional(v.boolean()),
      mentionAlerts: v.optional(v.boolean()),
      taskReminders: v.optional(v.boolean()),
    }),
  ),
});

const subtaskValidator = v.object({
  id: v.string(),
  title: v.string(),
  completed: v.boolean(),
});

const milestoneValidator = v.object({
  id: v.string(),
  title: v.string(),
  date: v.string(),
  completed: v.boolean(),
});

const metadataValidator = v.object({
  projectId: v.optional(v.string()),
  taskId: v.optional(v.string()),
});

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("manager"), v.literal("member"))),
    jobTitle: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    preferences: v.optional(preferencesValidator),
  }).index("userId", ["userId"]),
  workspaces: defineTable({
    legacySupabaseId: v.optional(v.string()),
    name: v.string(),
    ownerId: v.id("users"),
    color: v.string(),
  })
    .index("ownerId", ["ownerId"])
    .index("legacySupabaseId", ["legacySupabaseId"]),
  projects: defineTable({
    legacySupabaseId: v.optional(v.string()),
    ownerId: v.id("users"),
    workspaceId: v.id("workspaces"),
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
  })
    .index("ownerId", ["ownerId"])
    .index("workspaceId", ["workspaceId"])
    .index("legacySupabaseId", ["legacySupabaseId"]),
  tasks: defineTable({
    legacySupabaseId: v.optional(v.string()),
    ownerId: v.id("users"),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("inProgress"),
      v.literal("inReview"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.string()),
    tags: v.array(v.string()),
    subtasks: v.array(subtaskValidator),
  })
    .index("ownerId", ["ownerId"])
    .index("projectId", ["projectId"])
    .index("legacySupabaseId", ["legacySupabaseId"]),
  activities: defineTable({
    legacySupabaseId: v.optional(v.string()),
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    entityName: v.optional(v.string()),
    metadata: v.optional(metadataValidator),
  })
    .index("userId", ["userId"])
    .index("legacySupabaseId", ["legacySupabaseId"]),
});
