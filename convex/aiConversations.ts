import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

const aiDraftTaskValidator = v.object({
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
  dueDate: v.optional(v.string()),
});

const pendingAiDraftValidator = v.object({
  projectName: v.string(),
  description: v.string(),
  workspaceId: v.string(),
  dueDate: v.optional(v.string()),
  tasks: v.array(aiDraftTaskValidator),
});

async function requireCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Unauthorized");
  }
  return userId;
}

async function requireOwnedConversation(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  conversationId: Id<"aiConversations">,
) {
  const conversation = await ctx.db.get(conversationId);
  if (conversation === null || conversation.ownerId !== userId) {
    throw new Error("Conversation not found");
  }
  return conversation;
}

const mapConversation = (conversation: Doc<"aiConversations">) => ({
  id: conversation._id,
  title: conversation.title,
  status: conversation.status,
  pendingDraft: conversation.pendingDraft,
  lastActivityAt: new Date(conversation.lastActivityAt).toISOString(),
});

const mapMessage = (message: Doc<"aiMessages">) => ({
  id: message._id,
  conversationId: message.conversationId,
  role: message.role,
  content: message.content,
  createdAt: new Date(message._creationTime).toISOString(),
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const conversations = await ctx.db
      .query("aiConversations")
      .withIndex("by_ownerId_and_lastActivityAt", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(50);

    return conversations.map(mapConversation);
  },
});

export const listMessages = query({
  args: {
    conversationId: v.optional(v.id("aiConversations")),
  },
  handler: async (ctx, args) => {
    if (!args.conversationId) {
      return [];
    }

    const { conversationId } = args;
    const userId = await requireCurrentUserId(ctx);
    await requireOwnedConversation(ctx, userId, conversationId);

    const messages = await ctx.db
      .query("aiMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .take(500);

    return messages.map(mapMessage);
  },
});

export const createConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db.insert("aiConversations", {
      ownerId: userId,
      title: "New chat",
      status: "active",
      pendingDraft: null,
      lastActivityAt: Date.now(),
    });
  },
});

export const appendMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    role: v.union(v.literal("user"), v.literal("model")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    await requireOwnedConversation(ctx, userId, args.conversationId);

    const messageId = await ctx.db.insert("aiMessages", {
      ownerId: userId,
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
    });

    await ctx.db.patch(args.conversationId, {
      lastActivityAt: Date.now(),
    });

    return messageId;
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    await requireOwnedConversation(ctx, userId, args.conversationId);

    await ctx.db.patch(args.conversationId, {
      title: args.title,
      lastActivityAt: Date.now(),
    });
  },
});

export const updatePendingDraft = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    pendingDraft: v.union(pendingAiDraftValidator, v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    await requireOwnedConversation(ctx, userId, args.conversationId);

    await ctx.db.patch(args.conversationId, {
      pendingDraft: args.pendingDraft,
      lastActivityAt: Date.now(),
    });
  },
});
