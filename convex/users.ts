import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

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

    return {
      id: user._id,
      name: profile?.fullName || user.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      avatarUrl:
        profile?.avatarUrl ||
        user.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name || user.email || "User",
        )}`,
      role: profile?.role || "member",
    };
  },
});
