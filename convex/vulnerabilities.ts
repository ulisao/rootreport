import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// --- FUNCIÓN AUXILIAR PARA IMÁGENES ---
async function enrichFindingsWithImages(ctx: QueryCtx, findings: Doc<"vulnerabilities">[]) {
  return await Promise.all(
    findings.map(async (finding) => {
      let imageUrls: string[] = [];
      if (finding.images && finding.images.length > 0) {
        imageUrls = (await Promise.all(
          finding.images.map((imgId) => ctx.storage.getUrl(imgId))
        )).filter((url): url is string => url !== null);
      }
      return { ...finding, imageUrls };
    })
  );
}

// 1. LISTAR HALLAZGOS POR PROYECTO
export const getFindings = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("vulnerabilities")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return await enrichFindingsWithImages(ctx, findings);
  },
});

// 2. LISTAR TODOS LOS HALLAZGOS DE LA ORG (Para TasksView)
export const getAllFindings = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    // Buscamos proyectos de la org
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const projectIds = new Set(projects.map((p) => p._id));

    // Traemos vulnerabilidades y filtramos las que pertenecen a esos proyectos
    const allFindings = await ctx.db.query("vulnerabilities").collect();
    const filteredFindings = allFindings.filter(f => projectIds.has(f.projectId));

    return await enrichFindingsWithImages(ctx, filteredFindings);
  },
});

// 3. CREAR HALLAZGO
export const createFinding = mutation({
  args: {
    projectId: v.id("projects"),
    orgId: v.string(),
    title: v.string(),
    description: v.string(),
    severity: v.string(),
    status: v.string(),
    remediation: v.optional(v.string()),
    cvssScore: v.optional(v.number()),
    cvssVector: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.orgId !== args.orgId) throw new Error("Forbidden");

    return await ctx.db.insert("vulnerabilities", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      severity: args.severity,
      status: args.status,
      remediation: args.remediation,
      cvssScore: args.cvssScore,
      cvssVector: args.cvssVector,
      images: args.images || [],
    });
  },
});

// 4. ACTUALIZAR HALLAZGO
export const updateFinding = mutation({
  args: {
    id: v.id("vulnerabilities"),
    orgId: v.string(), 
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    severity: v.optional(v.string()),
    status: v.optional(v.string()),
    remediation: v.optional(v.string()),
    cvssScore: v.optional(v.number()),
    cvssVector: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const finding = await ctx.db.get(args.id);
    if (!finding) throw new Error("Not found");

    const project = await ctx.db.get(finding.projectId);
    if (!project || project.orgId !== args.orgId) throw new Error("Forbidden");

    const { id, orgId, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});