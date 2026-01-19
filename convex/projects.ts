import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values"; // Import único y consolidado

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    orgId: v.string(),
    status: v.optional(v.union(
      v.literal("active"), 
      v.literal("completed"), 
      v.literal("archived")
    )), 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    // --- DEBUGGING (Mirá tu terminal donde corre npx convex dev) ---
    console.log("Usuario intentando crear:", identity.email);
    console.log("Metadata recibida:", identity.publicMetadata);
    // -------------------------------------------------------------

    // Type casting seguro
    const metadata = identity.publicMetadata as { plan?: string };
    const isPro = metadata?.plan === "enterprise";

    console.log("¿Es Pro?", isPro); // Debug

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const FREE_LIMIT = 3;

    if (!isPro && projects.length >= FREE_LIMIT) {
      throw new ConvexError({
        message: `Has alcanzado el límite de ${FREE_LIMIT} proyectos gratuitos.`,
        code: "LIMIT_REACHED"
      });
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      orgId: args.orgId,
      status: args.status || "active",
      createdById: identity.subject,
    });

    return projectId;
  },
});

// 2. Listar proyectos
export const getProjects = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

// 3. Obtener un solo proyecto (Para el reporte PDF)
export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});