import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

async function requireCurrentUserId(ctx: QueryCtx | MutationCtx) {
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

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_ownerId_and_startDate", (q) => q.eq("ownerId", userId))
      .take(500);

    return events.map((event) => ({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      attendees: event.attendees,
      projectId: event.projectId,
      location: event.location,
      color: event.color,
    }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    attendees: v.array(v.string()),
    projectId: v.optional(v.id("projects")),
    location: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);

    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (project === null || project.ownerId !== userId) {
        throw new Error("Project not found");
      }
    }

    return await ctx.db.insert("calendarEvents", {
      ownerId: userId,
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      attendees: args.attendees,
      projectId: args.projectId,
      location: args.location,
      color: args.color,
    });
  },
});
