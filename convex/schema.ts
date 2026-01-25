import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Usuarios (Sincronizado con Clerk)
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    orgIds: v.array(v.string()), 
  }).index("by_token", ["tokenIdentifier"]),

  // Proyectos
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    orgId: v.string(), // ID de la organización de Clerk
    status: v.string(), // "active", "archived"
    createdBy: v.string(),
  }).index("by_orgId", ["orgId"]),

  // Vulnerabilidades (Hallazgos)
  vulnerabilities: defineTable({
    title: v.string(),
    description: v.string(),
    severity: v.string(), // "critical", "high", "medium", "low", "info"
    status: v.string(),   // "open", "closed", "mitigated"
    remediation: v.optional(v.string()),
    cvssScore: v.optional(v.number()),
    cvssVector: v.optional(v.string()),
    
    // CORRECCIÓN: Usamos v.id() para integridad referencial
    projectId: v.id("projects"), 
    
    images: v.optional(v.array(v.string())), // Array de Storage IDs
    
    // Campos opcionales para reporte
    affectedUrl: v.optional(v.string()),
  }).index("by_projectId", ["projectId"]),

  // Banco de Hallazgos (Templates)
  templates: defineTable({
    title: v.string(),
    description: v.string(),
    remediation: v.optional(v.string()),
    severity: v.string(),
    cvssVector: v.optional(v.string()),
    orgId: v.string(), 
    createdById: v.string(),
  }).index("by_orgId", ["orgId"]),

  // Suscripciones
  subscriptions: defineTable({
    orgId: v.string(),
    plan: v.string(), // "free", "pro", "enterprise"
    status: v.string(), // "active", "cancelled", "past_due"
    mercadoPagoId: v.optional(v.string()),
    endsAt: v.optional(v.number()),
  }).index("by_orgId", ["orgId"]),

  // Configuración de la Organización
  orgSettings: defineTable({
    orgId: v.string(),
    primaryColor: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  }).index("by_orgId", ["orgId"]),
});