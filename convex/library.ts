import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listTemplates = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const createTemplate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    remediation: v.optional(v.string()),
    severity: v.string(),
    cvssVector: v.optional(v.string()),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.insert("templates", {
      ...args,
      createdById: identity.subject,
    });
  },
});

// CORRECCIÓN DE SEGURIDAD
export const deleteTemplate = mutation({
  args: { 
      id: v.id("templates"),
      orgId: v.string() // Obligatorio
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Template not found");

    // IDOR CHECK
    if (template.orgId !== args.orgId) {
        throw new Error("Forbidden: Cannot delete template from another organization");
    }
    
    await ctx.db.delete(args.id);
  },
});