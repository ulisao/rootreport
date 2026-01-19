import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    // 1. Verificamos usuario
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 2. Traemos TODAS las vulns de la organización
    // (Para un MVP esto está bien. Si tenés 1 millón de registros, se hace de otra forma)
    const findings = await ctx.db
      .query("vulnerabilities")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    // 3. Calculamos Estadísticas en el servidor
    const total = findings.length;
    const critical = findings.filter((f) => f.severity === "critical" && f.status !== "resolved").length;
    const resolved = findings.filter((f) => f.status === "resolved").length;

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