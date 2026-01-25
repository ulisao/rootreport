import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. LISTAR PLANTILLAS (Para la pantalla de Librería y el Importador)
export const listTemplates = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("templates")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc") // Las más nuevas primero
      .collect();
  },
});

// 2. CREAR PLANTILLA
export const createTemplate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    remediation: v.optional(v.string()),
    severity: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low"), v.literal("info")),
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

// 3. BORRAR PLANTILLA
export const deleteTemplate = mutation({
  args: { 
    id: v.id("templates"),
    orgId: v.string() // <--- Agregamos esto para validar propiedad
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.id);
    if (!template) {
        throw new Error("Template not found");
    }

    // CHECK DE SEGURIDAD:
    // Solo permitimos borrar si la plantilla pertenece a la Org que dice el usuario
    if (template.orgId !== args.orgId) {
        throw new Error("Forbidden: You cannot delete templates from other organizations");
    }
    
    await ctx.db.delete(args.id);
  },
});