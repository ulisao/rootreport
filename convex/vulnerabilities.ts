import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Listar vulnerabilidades de un proyecto (CON URLs DE IMÁGENES)
export const getFindings = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Verificamos identidad
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const findings = await ctx.db
      .query("vulnerabilities")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc") 
      .collect();

    // TRANSFORMACIÓN MÁGICA: Convertimos IDs -> URLs
    return await Promise.all(
      findings.map(async (f) => ({
        ...f,
        // Si tiene imágenes, pedimos las URLs firmadas a Convex Storage
        imageUrls: f.images 
          ? await Promise.all(f.images.map((id) => ctx.storage.getUrl(id)))
          : []
      }))
    );
  },
});

// 2. Crear una nueva vulnerabilidad
export const createFinding = mutation({
  args: {
    projectId: v.id("projects"),
    orgId: v.string(),
    title: v.string(),
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    ),
    status: v.optional(v.union(v.literal("open"), v.literal("confirmed"), v.literal("mitigated"), v.literal("accepted_risk"), v.literal("closed"))),
    remediation: v.optional(v.string()),
    description: v.string(),
    cvssScore: v.optional(v.number()),
    cvssVector: v.optional(v.string()),
    // Agregamos soporte para imágenes desde la creación
    images: v.optional(v.array(v.string())), 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    await ctx.db.insert("vulnerabilities", {
      title: args.title,
      description: args.description,
      severity: args.severity,
      status: args.status ?? "open",
      remediation: args.remediation,
      projectId: args.projectId,
      orgId: project.orgId,
      cvssScore: args.cvssScore,
      cvssVector: args.cvssVector,
      images: args.images ?? [], // Guardamos el array o vacío
    });
  },
});

// 3. Actualizar una vulnerabilidad existente
export const updateFinding = mutation({
  args: {
    id: v.id("vulnerabilities"),
    title: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    )),
    status: v.optional(v.union(v.literal("open"), v.literal("confirmed"), v.literal("mitigated"), v.literal("accepted_risk"), v.literal("closed"))),
    description: v.optional(v.string()),
    remediation: v.optional(v.string()),
    cvssScore: v.optional(v.number()),
    cvssVector: v.optional(v.string()),
    // Array de IDs de Storage
    images: v.optional(v.array(v.string())), 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    const isPro = false; // Asumimos que todos son Free por ahora
    const FREE_IMAGE_LIMIT = 2;

    if (!isPro && args.images && args.images.length > FREE_IMAGE_LIMIT) {
        throw new Error(`El plan gratuito solo permite hasta ${FREE_IMAGE_LIMIT} imágenes por hallazgo.`);
    }

    const { id, ...fields } = args;
    
    await ctx.db.patch(id, fields);
  },
});

// 4. Eliminar una vulnerabilidad
export const deleteFinding = mutation({
  args: { id: v.id("vulnerabilities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    // TODO: Idealmente aquí también borraríamos los archivos del storage usando ctx.storage.delete(id)
    // para no dejar basura, pero para el MVP está bien así.
    await ctx.db.delete(args.id);
  },
});

// 5. Obtener TODAS las vulnerabilidades (CON URLs)
export const getAllFindings = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const findings = await ctx.db
      .query("vulnerabilities")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();

    // TRANSFORMACIÓN MÁGICA AQUÍ TAMBIÉN
    return await Promise.all(
      findings.map(async (f) => ({
        ...f,
        imageUrls: f.images 
          ? await Promise.all(f.images.map((id) => ctx.storage.getUrl(id)))
          : []
      }))
    );
  },
});

// 6. Generar URL de subida
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});