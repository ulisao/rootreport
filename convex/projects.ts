import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values"; // Import único y consolidado

async function checkSubscription(ctx: any, orgId: string) {
  const sub = await ctx.db
    .query("subscriptions")
    .withIndex("by_orgId", (q: any) => q.eq("orgId", orgId))
    .first();

  // Es PRO si existe, el plan es pro/enterprise y el status es active
  const isPro = sub && (sub.plan === "pro" || sub.plan === "enterprise") && sub.status === "active";
  return isPro;
}

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

    // 1. CHEQUEO DE SUSCRIPCIÓN (NUEVO)
    // Consultamos nuestra propia DB, no Clerk.
    const isPro = await checkSubscription(ctx, args.orgId);

    // 2. CONTAR PROYECTOS EXISTENTES
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const FREE_LIMIT = 3;

    // 3. APLICAR CANDADO
    if (!isPro && projects.length >= FREE_LIMIT) {
      throw new ConvexError({
        message: `Has alcanzado el límite de ${FREE_LIMIT} proyectos gratuitos. Actualiza a PRO para continuar.`,
        code: "LIMIT_REACHED"
      });
    }

    // 4. CREAR SI PASÓ EL CONTROL
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