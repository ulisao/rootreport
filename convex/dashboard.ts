import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    // 1. Obtener todos los PROYECTOS de la organización
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const projectIds = projects.map((p) => p._id);

    // 2. Obtener las VULNERABILIDADES de esos proyectos
    // Usamos Promise.all para paralelizar
    const vulnerabilitiesNested = await Promise.all(
      projectIds.map((pid) =>
        ctx.db
          .query("vulnerabilities")
          .withIndex("by_projectId", (q) => q.eq("projectId", pid))
          .collect()
      )
    );

    const vulnerabilities = vulnerabilitiesNested.flat();

    // 3. Calcular Estadísticas
    const totalProjects = projects.length;
    const totalVulns = vulnerabilities.length;
    
    const critical = vulnerabilities.filter((v) => v.severity === "critical").length;
    const high = vulnerabilities.filter((v) => v.severity === "high").length;
    const medium = vulnerabilities.filter((v) => v.severity === "medium").length;
    const low = vulnerabilities.filter((v) => v.severity === "low").length;
    const info = vulnerabilities.filter((v) => v.severity === "info").length;

    const open = vulnerabilities.filter((v) => v.status === "open").length;
    const closed = vulnerabilities.filter((v) => v.status === "closed").length;
    const mitigated = vulnerabilities.filter((v) => v.status === "mitigated").length;

    return {
      totalProjects,
      totalVulns,
      openVulns: open,
      fixedVulns: closed + mitigated,
      severityDistribution: [
        { name: "Crítica", value: critical, fill: "#ef4444" },
        { name: "Alta", value: high, fill: "#f97316" },
        { name: "Media", value: medium, fill: "#eab308" },
        { name: "Baja", value: low, fill: "#3b82f6" },
        { name: "Info", value: info, fill: "#64748b" },
      ],
      statusDistribution: [
        { name: "Abierto", value: open, fill: "#ef4444" },
        { name: "Mitigado", value: mitigated, fill: "#eab308" },
        { name: "Cerrado", value: closed, fill: "#10b981" },
      ],
      recentFindings: vulnerabilities
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 5)
        .map(v => ({
            _id: v._id,
            title: v.title,
            severity: v.severity,
            project: projects.find(p => p._id === v.projectId)?.name || "Sin Proyecto",
            date: v._creationTime
        }))
    };
  },
});