import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

async function requireCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Unauthorized");
  }
  return userId;
}

async function requireOwnedProject(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (project === null || project.ownerId !== userId) {
    throw new Error("Project not found");
  }
  return project;
}

async function requireOwnedSuggestion(
  ctx: MutationCtx,
  userId: Id<"users">,
  suggestionId: Id<"projectSuggestions">,
) {
  const suggestion = await ctx.db.get(suggestionId);
  if (suggestion === null || suggestion.ownerId !== userId) {
    throw new Error("Suggestion not found");
  }
  return suggestion;
}

function mapSuggestion(suggestion: Doc<"projectSuggestions">) {
  return {
    id: suggestion._id,
    projectId: suggestion.projectId,
    source: suggestion.source,
    status: suggestion.status,
    content: suggestion.content,
    createdByUserId: suggestion.createdByUserId,
    createdAt: new Date(suggestion._creationTime).toISOString(),
  };
}

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("saved"),
        v.literal("dismissed"),
        v.literal("applied"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    await requireOwnedProject(ctx, userId, args.projectId);

    const { status } = args;
    if (status) {
      const suggestions = await ctx.db
        .query("projectSuggestions")
        .withIndex("by_ownerId_and_projectId_and_status", (q) =>
          q.eq("ownerId", userId).eq("projectId", args.projectId).eq("status", status),
        )
        .order("desc")
        .take(100);

      return suggestions.map(mapSuggestion);
    }

    const suggestions = await ctx.db
      .query("projectSuggestions")
      .withIndex("by_ownerId_and_projectId", (q) =>
        q.eq("ownerId", userId).eq("projectId", args.projectId),
      )
      .order("desc")
      .take(100);

    return suggestions.map(mapSuggestion);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    source: v.union(v.literal("autopilot"), v.literal("manual")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    await requireOwnedProject(ctx, userId, args.projectId);

    return await ctx.db.insert("projectSuggestions", {
      ownerId: userId,
      projectId: args.projectId,
      source: args.source,
      status: "new",
      content: args.content.trim(),
      createdByUserId: args.source === "manual" ? userId : undefined,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("projectSuggestions"),
    status: v.union(
      v.literal("new"),
      v.literal("saved"),
      v.literal("dismissed"),
      v.literal("applied"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const suggestion = await requireOwnedSuggestion(ctx, userId, args.id);
    await requireOwnedProject(ctx, userId, suggestion.projectId);

    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});
