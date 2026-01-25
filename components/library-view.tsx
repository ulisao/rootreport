"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Book, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProLockScreen } from "@/components/pro-lock-screen";

type Severity = "info" | "low" | "medium" | "high" | "critical";

export function LibraryView() {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  // 1. CHEQUEO DE SUSCRIPCIÓN
  const subscription = useQuery(api.subscriptions.getMySubscription, 
    orgId ? { orgId } : "skip"
  );
  
  // Queries de la librería
  const templates = useQuery(api.library.listTemplates, orgId ? { orgId } : "skip");
  const createTemplate = useMutation(api.library.createTemplate);
  const deleteTemplate = useMutation(api.library.deleteTemplate);

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    remediation: "",
    severity: "low",
  });

  // --- LÓGICA DE BLOQUEO ---
  
  if (subscription === undefined || templates === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
      </div>
    );
  }

  const isPro = subscription?.plan === "pro" || subscription?.plan === "enterprise";

  if (!isPro) {
    return (
        <ProLockScreen 
            featureName="Banco de Hallazgos" 
            description="Crea plantillas de vulnerabilidades, reutilízalas en todos tus proyectos y ahorra horas de redacción manual."
        />
    );
  }

  // --- FIN LÓGICA DE BLOQUEO ---

  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!orgId) return;
    setIsSubmitting(true);
    try {
      await createTemplate({
        ...formData,
        orgId,
        severity: formData.severity as Severity, 
      });
      toast.success("Plantilla guardada en tu librería");
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", remediation: "", severity: "low" });
    } catch (error) {
      toast.error("Error al crear la plantilla");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    // CORRECCIÓN DE SEGURIDAD APLICADA:
    if (!orgId) return; // Validamos que tengamos la Org

    if (confirm("¿Seguro que quieres borrar esta plantilla?")) {
      try {
        // Pasamos ID y orgId para evitar IDOR
        await deleteTemplate({ id, orgId });
        toast.success("Plantilla eliminada");
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Book className="h-6 w-6 text-emerald-500" /> Banco de Hallazgos
          </h1>
          <p className="text-zinc-400 text-sm">
            Gestiona tus plantillas de vulnerabilidades para reportar más rápido.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Plantilla</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Guarda un hallazgo común para reutilizarlo en futuros reportes.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título del Hallazgo</Label>
                <Input 
                  placeholder="Ej: Cross-Site Scripting (Reflected)" 
                  className="bg-zinc-900 border-zinc-800"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Severidad Base</Label>
                <Select 
                    value={formData.severity} 
                    onValueChange={(v) => setFormData({...formData, severity: v})}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descripción Técnica</Label>
                <Textarea 
                  placeholder="Explica la vulnerabilidad..." 
                  className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Remediación Sugerida</Label>
                <Textarea 
                  placeholder="Cómo solucionar el problema..." 
                  className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                  value={formData.remediation}
                  onChange={(e) => setFormData({...formData, remediation: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-zinc-900 text-zinc-400">Cancelar</Button>
              <Button onClick={handleCreate} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Plantilla"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar plantillas..." 
          className="pl-10 bg-zinc-900/50 border-zinc-800 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRID DE PLANTILLAS */}
      {filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-zinc-100 text-base leading-tight">
                        {template.title}
                    </CardTitle>
                    <Badge variant="outline" className={`capitalize shrink-0 ${getSeverityColor(template.severity)}`}>
                        {template.severity}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <p className="text-xs text-zinc-500 line-clamp-3">
                    {template.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(template._id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg p-12 text-zinc-500">
            <Book className="h-10 w-10 mb-4 opacity-50" />
            <p className="font-medium">Tu librería está vacía</p>
            <p className="text-sm">Crea tu primera plantilla para empezar.</p>
        </div>
      )}

    </div>
  );
}