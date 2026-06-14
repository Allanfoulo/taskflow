import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireCurrentUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export const create = mutation({
  args: {
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
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.string()),
    tags: v.array(v.string()),
    subtasks: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        completed: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (project === null || project.ownerId !== userId) {
      throw new Error("Project not found");
    }

    return await ctx.db.insert("tasks", {
      ownerId: userId,
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      assigneeId: args.assigneeId,
      dueDate: args.dueDate,
      tags: args.tags,
      subtasks: args.subtasks,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("inProgress"),
        v.literal("inReview"),
        v.literal("done"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    ),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    subtasks: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          completed: v.boolean(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (task === null || task.ownerId !== userId) {
      throw new Error("Task not found");
    }

    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (task === null || task.ownerId !== userId) {
      throw new Error("Task not found");
    }

    await ctx.db.delete(args.id);
  },
});
