"use client"

import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"
import { Doc } from "@/convex/_generated/dataModel"
import { CheckCircle2, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function TasksView() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { user, isLoaded: isUserLoaded } = useUser()
  
  const orgId = organization?.id || user?.id

  // 1. QUERY: Obtenemos todos los hallazgos de la organización
  const findings = useQuery(api.vulnerabilities.getAllFindings, orgId ? { orgId } : "skip")
  const updateFinding = useMutation(api.vulnerabilities.updateFinding)

  const toggleTask = async (finding: Doc<"vulnerabilities">) => {
    if (!orgId) return;

    const isClosed = finding.status === "closed" || finding.status === "mitigated";
    const newStatus = isClosed ? "open" : "closed";

    try {
      await updateFinding({
        id: finding._id,
        orgId: orgId, // Requerido por seguridad
        status: newStatus
      })
      toast.success(isClosed ? "Tarea reabierta" : "Tarea completada");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la tarea");
    }
  }

  const getPriorityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-400 border-red-500/20"
      case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  }

  if (!isOrgLoaded || !isUserLoaded || findings === undefined) {
    return (
        <div className="flex h-full items-center justify-center p-8">
            <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
        </div>
    )
  }

  const totalFindings = findings.length
  const resolvedCount = findings.filter(f => f.status === "closed" || f.status === "mitigated").length
  const openFindings = totalFindings - resolvedCount
  const criticalPending = findings.filter(f => f.severity === "critical" && f.status === "open").length

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Tareas Pendientes</h1>
        <p className="text-zinc-400 mt-1">
            Gestión centralizada de hallazgos abiertos en todos tus proyectos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" /> Críticas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{criticalPending}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Total Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{openFindings}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Lista de Trabajo</CardTitle>
          <CardDescription className="text-zinc-500">
             {totalFindings === 0 ? "No hay hallazgos registrados." : "Hallazgos consolidados de la organización."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {findings.map((finding) => {
               const isCompleted = finding.status === "closed" || finding.status === "mitigated";
               
               return (
                <div
                    key={finding._id}
                    className={`flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all ${
                    isCompleted ? "opacity-60 bg-zinc-950" : "bg-zinc-900"
                    }`}
                >
                    <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleTask(finding)}
                        className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
                    />
                    
                    <div className="flex-1 min-w-0 grid gap-1">
                        <div className="flex items-center gap-2">
                            <Link href={`/dashboard/projects/${finding.projectId}`} className="hover:underline truncate">
                                <span className={`font-medium text-zinc-100 ${isCompleted ? "line-through text-zinc-500" : ""}`}>
                                    {finding.title}
                                </span>
                            </Link>
                            <Badge variant="outline" className={`${getPriorityColor(finding.severity)} capitalize text-[10px] h-5 px-1.5`}>
                                {finding.severity}
                            </Badge>
                        </div>
                        <p className="text-sm text-zinc-500 truncate">
                            {finding.description || "Sin descripción"}
                        </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-500">
                         <span>{new Date(finding._creationTime).toLocaleDateString()}</span>
                    </div>

                    <Link href={`/dashboard/projects/${finding.projectId}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-emerald-500">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )})}
            
            {totalFindings === 0 && (
                <div className="text-center py-12 text-zinc-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                    <p>¡Todo al día! No tienes tareas pendientes.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}