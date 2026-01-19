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
    projectId: v.id("projects"),
    orgId: v.string(),
    title: v.string(),
    description: v.string(),
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    ),
    remediation: v.optional(v.string()), // Pasos para arreglarlo
    status: v.union(v.literal("open"), v.literal("in_review"), v.literal("resolved")),
  }).index("by_projectId", ["projectId"])
    .index("by_orgId", ["orgId"]),

  // Metadata de usuarios (para sincronizar datos extra de Clerk si hace falta)
  users: defineTable({
    tokenIdentifier: v.string(), // El sub de Clerk
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
});