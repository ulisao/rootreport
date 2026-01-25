"use client"

import Link from "next/link"
import { Search, Filter, FolderKanban, Trash2, Loader2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Doc, Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization } from "@clerk/nextjs"
import { toast } from "sonner"
import { useState } from "react"

interface ProjectsListViewProps {
  projects?: Doc<"projects">[]
}

export function ProjectsListView({ projects }: ProjectsListViewProps) {
  const { organization } = useOrganization();
  const orgId = organization?.id;
  
  const deleteProject = useMutation(api.projects.deleteProject);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteProject = async (e: React.MouseEvent, projectId: Id<"projects">, projectName: string) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!orgId) return;

    setDeletingId(projectId);
    try {
        await deleteProject({ id: projectId, orgId });
        toast.success(`Proyecto "${projectName}" eliminado`);
    } catch (error) {
        console.error(error);
        toast.error("Error al eliminar el proyecto");
    } finally {
        setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "archived": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  }

  if (projects === undefined) {
      return (
          <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
      )
  }

  if (projects.length === 0) {
      return (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-lg">
              <FolderKanban className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-300">No hay proyectos aún</h3>
              <p className="text-zinc-500">Crea tu primer proyecto para comenzar.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
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
          <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
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
                      <p className="text-sm text-zinc-500 line-clamp-1">
                        {project.description || "Sin descripción"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`capitalize ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                    
                    {/* ALERT DIALOG DE BORRADO */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 z-10"
                          onClick={(e) => e.stopPropagation()} 
                          disabled={deletingId === project._id}
                        >
                          {deletingId === project._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                              <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border-zinc-800 text-zinc-100">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            Esta acción eliminará permanentemente el proyecto 
                            <span className="font-bold text-zinc-100"> "{project.name}" </span>
                            y todos sus reportes. No se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()} className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={(e) => handleDeleteProject(e, project._id, project.name)}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      Creado el {new Date(project._creationTime).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}