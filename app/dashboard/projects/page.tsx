"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { ProjectsListView } from "@/components/projects-list-view"; // Asegurate que el archivo se llame así
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const { organization, isLoaded } = useOrganization();
  const orgId = organization?.id;

  // Consulta de proyectos
  const projects = useQuery(api.projects.listProjects, orgId ? { orgId } : "skip");
  
  const createProject = useMutation(api.projects.createProject);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim() || !orgId) return;

    setIsCreating(true);
    try {
      await createProject({
        name: newProjectName,
        description: newProjectDesc,
        orgId,
      });
      toast.success("Proyecto creado exitosamente");
      setIsDialogOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el proyecto");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8"><Skeleton className="h-12 w-48 mb-8" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Proyectos</h1>
          <p className="text-zinc-400">Gestiona tus auditorías y análisis de seguridad.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>Define el nombre y alcance de la auditoría.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Nombre del Proyecto</label>
                <Input 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ej: Auditoría E-commerce 2024"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Descripción (Opcional)</label>
                <Textarea 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Detalles sobre el alcance, objetivos..."
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-800 hover:bg-zinc-900 text-zinc-300">
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Proyecto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pasamos los datos reales al componente */}
      <ProjectsListView projects={projects} />
    </div>
  );
}