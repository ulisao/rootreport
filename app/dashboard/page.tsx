"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"
import { 
  FolderKanban, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Loader2,
  CheckCircle2,
  Activity
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case "completed": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }
}

export default function DashboardPage() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { user, isLoaded: isUserLoaded } = useUser()
  
  const orgId = organization?.id || user?.id

  // --- QUERY 1: Proyectos ---
  const projects = useQuery(api.projects.getProjects, orgId ? { orgId } : "skip")
  
  // --- QUERY 2: Estadísticas Globales (Nuevo) ---
  const stats = useQuery(api.dashboard.getStats, orgId ? { orgId } : "skip")

  // Helper para buscar nombre del proyecto por ID (para la lista de actividad)
  const getProjectName = (id: string) => {
    return projects?.find(p => p._id === id)?.name || "Proyecto..."
  }

  if (!isOrgLoaded || !isUserLoaded) {
    return <div className="h-screen flex items-center justify-center text-zinc-400"><Loader2 className="animate-spin mr-2" /> Cargando RootReport...</div>
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Hola, {user?.firstName || "Hacker"} 👋
          </h1>
          <p className="text-zinc-400 mt-1">
            Resumen de seguridad de {organization?.name || "tu espacio personal"}.
          </p>
        </div>

        
      </div>

      {/* KPI CARDS REALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Proyectos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Proyectos Activos</CardTitle>
            <FolderKanban className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">
              {projects ? projects.length : "-"}
            </div>
          </CardContent>
        </Card>

        {/* 2. Vulnerabilidades Totales */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Hallazgos Totales</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">
              {stats ? stats.total : "-"}
            </div>
          </CardContent>
        </Card>
        
        {/* 3. Críticas Abiertas */}
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Críticas (Abiertas)</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {stats ? stats.critical : "-"}
                </div>
            </CardContent>
        </Card>

        {/* 4. Resueltas */}
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Resueltas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {stats ? stats.resolved : "-"}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ACTIVIDAD RECIENTE (REAL) */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Actividad Reciente
            </CardTitle>
            <CardDescription className="text-zinc-500">Últimos hallazgos reportados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                 <p className="text-sm text-zinc-500 italic">No hay actividad reciente.</p>
              ) : (
                stats.recentActivity.map((vuln) => (
                    <div key={vuln._id} className="flex gap-3 items-start pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 
                            ${vuln.severity === 'critical' ? 'bg-red-500' : 
                              vuln.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} 
                        />
                        <div className="min-w-0">
                            <p className="text-sm text-zinc-200 font-medium truncate">
                                {vuln.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                                En <span className="text-emerald-400">{getProjectName(vuln.projectId)}</span>
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-1">
                                {new Date(vuln._creationTime).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* TABLA DE PROYECTOS */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100">Proyectos Activos</CardTitle>
              <CardDescription className="text-zinc-500">Tus auditorías en curso</CardDescription>
            </div>
            <Link href="/dashboard/projects">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!projects ? (
               <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : projects.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                    <FolderKanban className="mx-auto h-10 w-10 mb-3 opacity-50" />
                    <p>No hay proyectos aún.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Proyecto</th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Estado</th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase">Fecha</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                    {projects.slice(0, 5).map((project) => (
                        <tr key={project._id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 px-2">
                            <Link
                            href={`/dashboard/projects/${project._id}`}
                            className="text-sm font-medium text-zinc-100 hover:text-emerald-400 transition-colors"
                            >
                            {project.name}
                            </Link>
                        </td>
                        <td className="py-3 px-2">
                            <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status.toUpperCase()}
                            </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-zinc-400">
                            {new Date(project._creationTime).toLocaleDateString()}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}