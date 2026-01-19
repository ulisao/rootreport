"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"
import { Doc } from "@/convex/_generated/dataModel"

import { CheckCircle2, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export function TasksView() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { user, isLoaded: isUserLoaded } = useUser()
  
  const orgId = organization?.id || user?.id

  // 1. TRAEMOS TODO (Data real)
  const findings = useQuery(api.vulnerabilities.getAllFindings, orgId ? { orgId } : "skip")
  const updateFinding = useMutation(api.vulnerabilities.updateFinding)

  // Función para marcar como completado (Resolved)
  const toggleTask = async (finding: Doc<"vulnerabilities">) => {
    const newStatus = finding.status === "resolved" ? "open" : "resolved";
    await updateFinding({
      id: finding._id,
      status: newStatus
    })
  }

  // Colores según severidad
  const getPriorityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-400 border-red-500/20"
      case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  }

  // Loading State
  if (!isOrgLoaded || !isUserLoaded || findings === undefined) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
  }

  // 2. CÁLCULO DE MÉTRICAS (En tiempo real)
  const totalFindings = findings.length
  const criticalPending = findings.filter(f => f.severity === "critical" && f.status !== "resolved").length
  const openFindings = findings.filter(f => f.status !== "resolved").length
  const resolvedCount = findings.filter(f => f.status === "resolved").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Tareas Pendientes</h1>
        <p className="text-zinc-400 mt-1">
            Gestiona tus hallazgos. Cada vulnerabilidad abierta cuenta como una tarea.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Card 1: Críticas (Urgente) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Críticas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{criticalPending}</div>
          </CardContent>
        </Card>

        {/* Card 2: Total Abiertas (Carga de trabajo) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Total Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{openFindings}</div>
          </CardContent>
        </Card>

        {/* Card 3: Resueltas (Logros) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Resueltas / Cerradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE TAREAS (VULNERABILIDADES) */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Lista de Trabajo</CardTitle>
          <CardDescription className="text-zinc-500">
             {totalFindings === 0 ? "No tienes tareas asignadas." : "Tus hallazgos en todos los proyectos."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {findings.map((finding) => {
               const isCompleted = finding.status === "resolved";
               
               return (
                <div
                    key={finding._id}
                    className={`flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors ${
                    isCompleted ? "opacity-50 bg-zinc-900/50" : "bg-zinc-900"
                    }`}
                >
                    {/* CHECKBOX REAL */}
                    <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleTask(finding)}
                        className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    
                    <div className="flex-1 min-w-0">
                        {/* El título lleva al proyecto */}
                        <Link href={`/dashboard/projects/${finding.projectId}`} className="hover:underline">
                            <p className={`font-medium text-zinc-100 ${isCompleted ? "line-through text-zinc-500" : ""}`}>
                                {finding.title}
                            </p>
                        </Link>
                        {/* Descripción cortada */}
                        <p className="text-sm text-zinc-500 truncate max-w-md">
                            {finding.description || "Sin descripción"}
                        </p>
                    </div>

                    {/* BADGES */}
                    <Badge variant="outline" className={`${getPriorityColor(finding.severity)} capitalize hidden sm:inline-flex`}>
                        {finding.severity}
                    </Badge>

                    {/* FECHA */}
                    <span className="text-sm text-zinc-500 whitespace-nowrap hidden sm:block">
                        {new Date(finding._creationTime).toLocaleDateString()}
                    </span>

                    {/* BOTÓN IR */}
                    <Link href={`/dashboard/projects/${finding.projectId}`}>
                        <ArrowRight className="h-4 w-4 text-zinc-600 hover:text-emerald-500 transition-colors" />
                    </Link>
                </div>
            )})}
            
            {totalFindings === 0 && (
                <div className="text-center py-8 text-zinc-500 italic">
                    ¡Estás al día! No hay vulnerabilidades reportadas.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}