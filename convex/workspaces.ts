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

    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("ownerId", (q) => q.eq("ownerId", userId))
      .collect();

    return workspaces.map((workspace) => ({
      id: workspace._id,
      name: workspace.name,
      color: workspace.color,
    }));
  },
});

export const ensureDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("ownerId", (q) => q.eq("ownerId", userId))
      .first();

    if (existing !== null) {
      return existing._id;
    }

    const user = await ctx.db.get(userId);
    return await ctx.db.insert("workspaces", {
      name: `${user?.name || "User"}'s Workspace`,
      ownerId: userId,
      color: "#4f46e5",
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db.insert("workspaces", {
      name: args.name,
      color: args.color,
      ownerId: userId,
    });
  },
});
