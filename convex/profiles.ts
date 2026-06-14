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

export const ensureCurrentProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile !== null) {
      return existingProfile._id;
    }

    const user = await ctx.db.get(userId);
    return await ctx.db.insert("profiles", {
      userId,
      fullName: user?.name,
      role: "member",
      jobTitle: "Member",
      preferences: {
        account: {
          language: "English",
          timezone: "Pacific Time (UTC-7)",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12-hour",
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          mentionAlerts: true,
          taskReminders: true,
        },
      },
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (user === null) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    const fallbackRole = profile?.role || "member";
    const fallbackJobTitle =
      fallbackRole === "admin"
        ? "Admin"
        : fallbackRole === "manager"
          ? "Manager"
          : "Member";

    return {
      name: profile?.fullName || user.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      role: profile?.role || "member",
      jobTitle: profile?.jobTitle || fallbackJobTitle,
      avatar: profile?.avatarUrl || user.image || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      joinDate: new Date(user._creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      preferences: profile?.preferences || {
        account: {
          language: "English",
          timezone: "Pacific Time (UTC-7)",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12-hour",
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          mentionAlerts: true,
          taskReminders: true,
        },
      },
    };
  },
});

export const updateCurrent = mutation({
  args: {
    name: v.string(),
    jobTitle: v.string(),
    avatar: v.string(),
    bio: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();

    const patch = {
      fullName: args.name,
      jobTitle: args.jobTitle,
      avatarUrl: args.avatar,
      bio: args.bio,
      location: args.location,
    };

    if (existingProfile === null) {
      await ctx.db.insert("profiles", {
        userId,
        ...patch,
      });
    } else {
      await ctx.db.patch(existingProfile._id, patch);
    }

    await ctx.db.patch(userId, {
      name: args.name,
      image: args.avatar || undefined,
    });
  },
});

export const updatePreferences = mutation({
  args: {
    account: v.optional(
      v.object({
        language: v.string(),
        timezone: v.string(),
        dateFormat: v.string(),
        timeFormat: v.string(),
      }),
    ),
    notifications: v.optional(
      v.object({
        emailNotifications: v.boolean(),
        pushNotifications: v.boolean(),
        weeklyDigest: v.boolean(),
        mentionAlerts: v.boolean(),
        taskReminders: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();

    const currentPreferences = existingProfile?.preferences || {};
    const nextPreferences = {
      ...currentPreferences,
      ...(args.account ? { account: args.account } : {}),
      ...(args.notifications ? { notifications: args.notifications } : {}),
    };

    if (existingProfile === null) {
      await ctx.db.insert("profiles", {
        userId,
        role: "member",
        preferences: nextPreferences,
      });
    } else {
      await ctx.db.patch(existingProfile._id, {
        preferences: nextPreferences,
      });
    }
  },
});
