import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        const name = String(params.name ?? "").trim();

        return {
          email,
          name: name || email.split("@")[0] || "User",
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId !== null) {
        return args.existingUserId;
      }

      const email =
        typeof args.profile.email === "string"
          ? args.profile.email.trim().toLowerCase()
          : undefined;

      if (email) {
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (existingUser) {
          await ctx.db.patch(existingUser._id, {
            ...args.profile,
            email,
          });
          return existingUser._id;
        }
      }

      return await ctx.db.insert("users", {
        ...args.profile,
        ...(email ? { email } : {}),
      });
    },
  },
});
