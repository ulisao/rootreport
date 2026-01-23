import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getMySubscription = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    if (!sub) return { plan: "free", status: "active" }; // Default

    return sub;
  },
});

export const upgradeToPro = mutation({
  args: {
    orgId: v.string(),
    mercadoPagoId: v.string(),
    plan: v.union(v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    // 1. Buscamos si ya existe una suscripción para esta Org
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    if (existing) {
      // 2. Si existe, la actualizamos
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: "active",
        mercadoPagoId: args.mercadoPagoId,
        // Opcional: Calcular fecha de fin si quisieras
      });
    } else {
      // 3. Si no existe, la creamos
      await ctx.db.insert("subscriptions", {
        orgId: args.orgId,
        plan: args.plan,
        status: "active",
        mercadoPagoId: args.mercadoPagoId,
      });
    }
  },
});