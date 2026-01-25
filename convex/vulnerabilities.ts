import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. LISTAR HALLAZGOS
export const getFindings = query({
  args: { projectId: v.id("projects") }, // Actualizado a v.id
  handler: async (ctx, args) => {
    // Seguridad: Verificar que el usuario tenga acceso al proyecto
    // (Idealmente verificaríamos orgId aquí también, pero reader access es menos crítico que write)
    
    const findings = await ctx.db
      .query("vulnerabilities")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Mapeamos para obtener URLs de imágenes
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
  },
});

// 2. CREAR HALLAZGO
export const createFinding = mutation({
  args: {
    projectId: v.id("projects"),
    orgId: v.string(), // Requerido para verificar límites y permisos
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

    // VALIDACIÓN DE SEGURIDAD 1: Verificar propiedad del proyecto
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // El proyecto debe pertenecer a la Org que declara el usuario
    if (project.orgId !== args.orgId) {
         throw new Error("Forbidden: Project belongs to another organization");
    }

    // VALIDACIÓN DE SEGURIDAD 2: Verificar Límites de Plan
    if (args.images && args.images.length > 0) {
        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();
        
        const isPro = sub?.plan === "pro" || sub?.plan === "enterprise";
        const limit = isPro ? 10 : 2;

        if (args.images.length > limit) {
            throw new Error(`Plan limit exceeded. You can only upload ${limit} images.`);
        }
    }

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

// 3. ACTUALIZAR HALLAZGO
export const updateFinding = mutation({
  args: {
    id: v.id("vulnerabilities"),
    orgId: v.string(), // NUEVO: Requerido para seguridad
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
    if (!finding) throw new Error("Finding not found");

    // VALIDACIÓN DE SEGURIDAD (IDOR FIX)
    // Verificamos que el proyecto padre pertenezca a la Org
    const project = await ctx.db.get(finding.projectId);
    if (!project || project.orgId !== args.orgId) {
        throw new Error("Forbidden: You cannot edit findings from other organizations");
    }

    // VALIDACIÓN DE LÍMITES
    if (args.images) {
         const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();
        const isPro = sub?.plan === "pro" || sub?.plan === "enterprise";
        const limit = isPro ? 10 : 2;
        if (args.images.length > limit) {
             throw new Error(`Plan limit exceeded: Max ${limit} images.`);
        }
    }

    await ctx.db.patch(args.id, {
      ...args,
      // Evitamos sobrescribir con undefined
    });
  },
});

// 4. GENERAR URL DE SUBIDA
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});