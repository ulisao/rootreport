"use client";

import Link from "next/link";
import { 
  FolderKanban, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  ShieldAlert,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { Doc } from "@/convex/_generated/dataModel";

// DEFINICIÓN DE TIPOS (Para que TypeScript no se queje)
interface DashboardStats {
  totalProjects: number;
  totalVulns: number;
  openVulns: number;
  fixedVulns: number;
  severityDistribution: { name: string; value: number; fill: string }[];
  statusDistribution: { name: string; value: number; fill: string }[];
  recentFindings: {
    _id: string;
    title: string;
    severity: string;
    project: string;
    date: number;
  }[];
}

interface DashboardViewProps {
  projects?: Doc<"projects">[];
  stats?: DashboardStats;
}

export function DashboardView({ projects, stats }: DashboardViewProps) {
  
  // SKELETON LOADING (Si los datos aún no llegaron)
  if (!stats || !projects) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl bg-zinc-900" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl bg-zinc-900" />
          <Skeleton className="h-80 rounded-xl bg-zinc-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400">Resumen de seguridad de tu organización.</p>
        </div>
        <Link href="/dashboard/projects">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Ver Proyectos
            </Button>
        </Link>
      </div>

      {/* 2. TARJETAS DE RESUMEN (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Proyectos Activos</CardTitle>
            <FolderKanban className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Hallazgos</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{stats.totalVulns}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Vulnerabilidades Abiertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.openVulns}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Mitigadas / Cerradas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{stats.fixedVulns}</div>
          </CardContent>
        </Card>
      </div>

      {/* 3. GRÁFICOS */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Distribución por Severidad (Bar Chart) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Severidad de Hallazgos</CardTitle>
            <CardDescription>Distribución de vulnerabilidades por riesgo.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.totalVulns > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.severityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {stats.severityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                    No hay datos suficientes
                </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Hallazgos (Pie Chart) */}
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-zinc-100">Estado Actual</CardTitle>
                <CardDescription>Proporción de hallazgos abiertos vs cerrados.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {stats.totalVulns > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                        No hay datos suficientes
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* 4. ACTIVIDAD RECIENTE */}
      <Card className="bg-zinc-900 border-zinc-800 col-span-2">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" /> Actividad Reciente
          </CardTitle>
          <CardDescription>Últimos hallazgos reportados en tus proyectos.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {stats.recentFindings.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">Sin actividad reciente.</div>
                ) : (
                    stats.recentFindings.map((finding) => (
                        <div key={finding._id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                            <div className="flex items-center gap-4">
                                <ShieldAlert className={`h-8 w-8 ${
                                    finding.severity === 'critical' ? 'text-red-500' :
                                    finding.severity === 'high' ? 'text-orange-500' :
                                    finding.severity === 'medium' ? 'text-yellow-500' :
                                    'text-blue-500'
                                }`} />
                                <div>
                                    <p className="font-medium text-zinc-200">{finding.title}</p>
                                    <p className="text-xs text-zinc-500">
                                        En <span className="text-zinc-400">{finding.project}</span> • {new Date(finding.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Link href={`/dashboard/projects/${finding._id}`} className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                                Ver <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}