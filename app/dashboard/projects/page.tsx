"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
  FolderKanban,
  Plus,
  Search,
  Loader2,
  MoreHorizontal,
  Calendar,
  Zap,
  Crown
} from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectsListPage() {
  const { organization, isLoaded } = useOrganization();
  const { user } = useUser();

  // 1. DETECTAR SI ES PRO (Igual que en Settings)
  // Usamos "enterprise" porque así lo configuramos en Clerk
  const isPro = (user?.publicMetadata as { plan?: string })?.plan === "enterprise";

  const orgId = organization?.id || user?.id;

  const projects = useQuery(
    api.projects.getProjects,
    orgId ? { orgId } : "skip"
  );
  const createProject = useMutation(api.projects.createProject);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

 const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newProjectName || !orgId) return;

  setIsCreating(true);
  try {
    await createProject({ name: newProjectName, orgId, status: "active" });
    setNewProjectName("");
    setIsDialogOpen(false);

    // ÉXITO BONITO
    toast.success("Proyecto creado correctamente", {
      description: `"${newProjectName}" ya está listo para auditar.`
    })

  } catch (error: any) {
    if (error.data?.code === "LIMIT_REACHED") {
      // ERROR DE LÍMITE
      toast.error("Límite de proyectos alcanzado", {
        description: "Actualiza a PRO para crear más auditorías.",
        action: {
          label: "Ver Planes",
          onClick: () => console.log("Ir a billing") // O redirigir a /settings
        },
      })
    } else {
      toast.error("Ocurrió un error inesperado")
      console.error(error);
    }
  } finally {
    setIsCreating(false);
  }
};

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-zinc-500/10 text-zinc-400";
  };

  const filteredProjects = projects?.filter((project) => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!isLoaded || projects === undefined) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <TableSkeleton />
      </div>
    );
  }

  // Lógica visual para la barra de progreso
  const maxProjects = isPro ? "∞" : 3;
  const projectCount = projects.length;
  // Si es Pro, la barra está siempre al 100% (o 0% según prefieras), si es Free calcula el porcentaje
  const progressValue = isPro ? 100 : (projectCount / 3) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Proyectos</h1>
          <p className="text-zinc-400">
            Gestiona todas tus auditorías y pentests.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Crear Proyecto</DialogTitle>
              <DialogDescription>
                Nombre para identificar la auditoría.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800"
                  placeholder="Ej: Pentest Cliente X"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isCreating ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Crear"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TARJETA DE PLAN (DINÁMICA) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className={`bg-zinc-900 border md:col-span-2 ${isPro ? "border-emerald-500/30" : "border-zinc-800"}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {isPro ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30">
                        PLAN PRO
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                        PLAN FREE
                    </Badge>
                )}
                <span className="text-sm text-zinc-400">Uso de proyectos</span>
              </div>
              <span className="text-sm font-bold text-zinc-100">
                {projectCount} / {maxProjects}
              </span>
            </div>

            <Progress
              value={progressValue}
              // Cambiamos el color de la barra si es Pro
              className={`h-2 bg-zinc-800 ${isPro ? "[&>div]:bg-emerald-500" : ""}`}
            />

            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-zinc-500">
                {isPro 
                    ? "Tienes acceso ilimitado a proyectos." 
                    : projectCount >= 3
                        ? "Has alcanzado el límite gratuito."
                        : `Te quedan ${3 - projectCount} proyectos.`
                }
              </p>

              {/* Botón cambia según el plan */}
              {!isPro ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors"
                    onClick={() => alert("Ir a Stripe...")}
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Pasar a PRO
                  </Button>
              ) : (
                  <Button variant="ghost" size="sm" disabled className="text-emerald-500 opacity-50">
                    <Crown className="w-3 h-3 mr-2" />
                    Miembro Premium
                  </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar proyectos..."
            className="pl-10 bg-zinc-900 border-zinc-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <FolderKanban className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No hay proyectos</p>
              <p className="text-sm">Crea el primero para comenzar.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
               <Search className="mx-auto h-12 w-12 mb-4 opacity-20" />
               <p>No se encontraron proyectos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                      Nombre
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                      Estado
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                      Fecha
                    </th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project._id}
                      className="group hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/projects/${project._id}`}
                          className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors block"
                        >
                          {project.name}
                        </Link>
                        <span className="text-xs text-zinc-500 line-clamp-1">
                          {project.description || "Sin descripción"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={getStatusColor(project.status)}
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(project._creationTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-500"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-zinc-900 border-zinc-800"
                          >
                            <DropdownMenuItem 
                                className="text-zinc-300 focus:bg-zinc-800"
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-red-400 focus:bg-zinc-800"
                            >
                              Archivar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
  );
}