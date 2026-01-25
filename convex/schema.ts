import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Proyectos de auditoría
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    orgId: v.string(), // ID de la organización de Clerk
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    createdById: v.string(),
  }).index("by_orgId", ["orgId"]),

  // Hallazgos / Vulnerabilidades
  vulnerabilities: defineTable({
    title: v.string(),
    description: v.string(),
    // Actualizamos el Union de estados con opciones más pro
    status: v.union(
      v.literal("open"),           // Abierta (Recién creada)
      v.literal("confirmed"),      // Confirmada (Validada por el pentester)
      v.literal("mitigated"),      // Mitigada (El cliente aplicó el fix)
      v.literal("accepted_risk"),  // Riesgo Aceptado (No lo van a arreglar)
      v.literal("closed")          // Cerrada (Verificada y lista)
    ),
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    ),
    // NUEVOS CAMPOS CVSS
    cvssScore: v.optional(v.number()), 
    cvssVector: v.optional(v.string()),
    
    remediation: v.optional(v.string()),
    projectId: v.id("projects"),
    orgId: v.string(),
    images: v.optional(v.array(v.string())),
  }).index("by_projectId", ["projectId"])
    .index("by_orgId", ["orgId"]),

  // Metadata de usuarios (para sincronizar datos extra de Clerk si hace falta)
  users: defineTable({
    tokenIdentifier: v.string(), // El sub de Clerk
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  subscriptions: defineTable({
    orgId: v.string(), // Vinculamos la suscripción a la Organización (o usuario)
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
    mercadoPagoId: v.optional(v.string()), // ID de suscripción en MP para referencias
    endsOn: v.optional(v.number()), // Fecha de fin (Unix timestamp) para cancelaciones
  }).index("by_orgId", ["orgId"]),

  templates: defineTable({
    title: v.string(),
    description: v.string(),
    remediation: v.optional(v.string()),
    
    // Valores por defecto sugeridos
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    ),
    cvssVector: v.optional(v.string()), // Para que ya venga con el puntaje calculado

    // Vinculamos a la Organización (así comparten plantillas entre el equipo)
    orgId: v.string(), 
    
    // Quién la creó (opcional, para audit log futuro)
    createdById: v.string(),
  }).index("by_orgId", ["orgId"]), // Índice para listar rápido

  orgSettings: defineTable({
    orgId: v.string(),
    primaryColor: v.optional(v.string()),   // Ej: "#10b981"
    logoStorageId: v.optional(v.id("_storage")), // ID del archivo en Convex Storage
  }).index("by_orgId", ["orgId"]),
});