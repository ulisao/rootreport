import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Listar vulnerabilidades de un proyecto específico
export const getFindings = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Verificamos identidad (opcionalmente podrías chequear si pertenece a la org)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("vulnerabilities")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc") // Las más nuevas primero
      .collect();
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
    description: v.string(),
    // status y remediation los manejamos con defaults o opcionales
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    await ctx.db.insert("vulnerabilities", {
      ...args,
      status: "open", // Siempre nacen abiertas
      remediation: "",
    });
  },
});

// 3. Actualizar una vulnerabilidad existente
export const updateFinding = mutation({
  args: {
    id: v.id("vulnerabilities"),
    // CORRECCIÓN: Usamos v.union para limitar las opciones igual que en el schema
    title: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    )),
    status: v.optional(v.union(
      v.literal("open"), 
      v.literal("in_review"), 
      v.literal("resolved")
    )),
    description: v.optional(v.string()),
    remediation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    // Extraemos el ID para no pasárselo al patch
    const { id, ...fields } = args;
    
    // Ahora TypeScript sabe que 'fields.status' es seguro
    await ctx.db.patch(id, fields);
  },
});

// 4. Eliminar una vulnerabilidad
export const deleteFinding = mutation({
  args: { id: v.id("vulnerabilities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autorizado");

    await ctx.db.delete(args.id);
  },
});

// 5. Obtener TODAS las vulnerabilidades de la organización (Para la vista de Tareas)
export const getAllFindings = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Usamos el índice by_orgId que creamos antes
    return await ctx.db
      .query("vulnerabilities")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc") // Las más nuevas primero
      .collect();
  },
});
