import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireCurrentUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("ownerId", (q) => q.eq("ownerId", userId))
      .collect();
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("ownerId", (q) => q.eq("ownerId", userId))
      .collect();

    return projects.map((project) => ({
      id: project._id,
      name: project.name,
      description: project.description,
      createdAt: new Date(project._creationTime).toISOString(),
      dueDate: project.dueDate,
      status: project.status,
      progress: project.progress,
      members: project.members,
      workspace: project.workspaceId,
      favorite: project.favorite,
      color: project.color,
      tags: project.tags,
      milestones: project.milestones,
      tasks: tasks
        .filter((task) => task.projectId === project._id)
        .map((task) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assigneeId,
          dueDate: task.dueDate,
          createdAt: new Date(task._creationTime).toISOString(),
          tags: task.tags,
          subtasks: task.subtasks,
          projectId: task.projectId,
        })),
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    workspaceId: v.id("workspaces"),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("onHold")),
    color: v.string(),
    tags: v.array(v.string()),
    members: v.array(v.string()),
    milestones: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        date: v.string(),
        completed: v.boolean(),
      }),
    ),
    favorite: v.boolean(),
    progress: v.number(),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db.insert("projects", {
      ownerId: userId,
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      dueDate: args.dueDate,
      status: args.status,
      progress: args.progress,
      members: args.members,
      favorite: args.favorite,
      color: args.color,
      tags: args.tags,
      milestones: args.milestones,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("onHold"))),
    progress: v.optional(v.number()),
    members: v.optional(v.array(v.string())),
    favorite: v.optional(v.boolean()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    milestones: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          date: v.string(),
          completed: v.boolean(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const project = await ctx.db.get(args.id);
    if (project === null || project.ownerId !== userId) {
      throw new Error("Project not found");
    }

    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const project = await ctx.db.get(args.id);
    if (project === null || project.ownerId !== userId) {
      throw new Error("Project not found");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("projectId", (q) => q.eq("projectId", args.id))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.id);
  },
});
