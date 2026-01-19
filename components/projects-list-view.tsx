"use client"

import Link from "next/link"
import { Plus, Search, Filter, FolderKanban, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Datos dummy (luego los reemplazarás con Convex)
const projects = [
  {
    id: "1",
    name: "E-commerce Security Audit",
    client: "TechCorp Inc.",
    status: "In Progress",
    progress: 65,
    dueDate: "Jan 25, 2026",
    vulnerabilities: { critical: 2, high: 5, medium: 8, low: 12 },
  },
  {
    id: "2",
    name: "Banking Portal Pentest",
    client: "SecureBank Ltd.",
    status: "Review",
    progress: 90,
    dueDate: "Jan 20, 2026",
    vulnerabilities: { critical: 0, high: 3, medium: 6, low: 4 },
  },
  {
    id: "3",
    name: "Healthcare App Assessment",
    client: "MedTech Solutions",
    status: "In Progress",
    progress: 40,
    dueDate: "Feb 1, 2026",
    vulnerabilities: { critical: 1, high: 2, medium: 4, low: 3 },
  },
  {
    id: "4",
    name: "API Gateway Security",
    client: "CloudFirst",
    status: "Starting",
    progress: 10,
    dueDate: "Feb 15, 2026",
    vulnerabilities: { critical: 0, high: 1, medium: 0, low: 2 },
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    case "Review":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    case "Starting":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    case "Completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }
}

export function ProjectsListView() {
  
  // Función simulada para borrar
  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault(); // Evita navegar al link
    e.stopPropagation(); // Evita navegar al link
    console.log(`Borrando proyecto ${projectId}...`);
    // ACÁ LLAMARÍAS A TU MUTATION DE CONVEX
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Proyectos</h1>
          <p className="text-zinc-400 mt-1">Gestiona tus auditorías de seguridad</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar proyectos..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-zinc-500">{project.client}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    
                    {/* ALERT DIALOG INTEGRADO */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 z-10"
                          onClick={(e) => e.stopPropagation()} // ¡IMPORTANTE! Evita entrar al proyecto al hacer click
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border-zinc-800 text-zinc-100">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto 
                            <span className="font-bold text-zinc-100"> "{project.name}" </span>
                            y todos sus reportes asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()} className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={(e) => handleDeleteProject(e, project.id)}
                          >
                            Sí, eliminar proyecto
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">Progreso</span>
                      <Progress value={project.progress} className="h-2 w-24 bg-zinc-800" />
                      <span className="text-xs text-zinc-400">{project.progress}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500">Vulns:</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                        {project.vulnerabilities.critical} C
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">
                        {project.vulnerabilities.high} H
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                        {project.vulnerabilities.medium} M
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                        {project.vulnerabilities.low} L
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-zinc-500">Vence: {project.dueDate}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}