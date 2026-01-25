import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listProjects = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      orgId: args.orgId,
      status: "active",
      createdBy: identity.subject,
    });
  },
});

// CORRECCIÓN DE SEGURIDAD
export const deleteProject = mutation({
  args: { 
      id: v.id("projects"),
      orgId: v.string() // Obligatorio para validar
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.id);
    if (!project) return; // O lanzar error

    // IDOR CHECK: Verificar que el proyecto pertenece a la Org solicitante
    if (project.orgId !== args.orgId) {
        throw new Error("Forbidden: Cannot delete project from another organization");
    }

    // Borrar vulnerabilidades asociadas primero (Limpieza)
    const findings = await ctx.db
        .query("vulnerabilities")
        .withIndex("by_projectId", q => q.eq("projectId", args.id))
        .collect();
    
    for (const f of findings) {
        await ctx.db.delete(f._id);
    }

    await ctx.db.delete(args.id);
  },
});