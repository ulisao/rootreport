import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    // 1. Verificamos usuario
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 2. Traemos TODAS las vulns de la organización
    // CORRECCIÓN 1: Usamos el índice correcto "by_org"
    const findings = await ctx.db
      .query("vulnerabilities")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    // 3. Calculamos Estadísticas con los NUEVOS estados
    const total = findings.length;

    // "Resueltos" ahora son los que están Mitigados o Cerrados manualmente
    const resolved = findings.filter((f) => 
      f.status === "mitigated" || 
      f.status === "closed"
    ).length;

    // "Críticos Activos": Son Critical Y NO están resueltos (Open, Confirmed o Accepted Risk)
    const critical = findings.filter((f) => 
      f.severity === "critical" && 
      (f.status === "open" || f.status === "confirmed" || f.status === "accepted_risk")
    ).length;

    // 4. Obtenemos las 5 más recientes para el feed de actividad
    const recentActivity = findings
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);

    return {
      total,
      critical,
      resolved,
      recentActivity
    };
  },
});