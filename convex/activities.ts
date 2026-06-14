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

    const activities = await ctx.db
      .query("activities")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    return activities.map((activity) => ({
      id: activity._id,
      userId: activity.userId,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      entityName: activity.entityName,
      metadata: activity.metadata || {},
      createdAt: new Date(activity._creationTime).toISOString(),
    }));
  },
});

export const log = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    entityName: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        projectId: v.optional(v.string()),
        taskId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db.insert("activities", {
      userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      entityName: args.entityName,
      metadata: args.metadata,
    });
  },
});
