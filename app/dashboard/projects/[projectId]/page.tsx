"use client"

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, Download, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { VulnerabilityDrawer } from "@/components/vulnerability-drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfReport } from "@/components/pdf-report";
import { toast } from "sonner";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  
  const { organization, isLoaded } = useOrganization();
  const orgId = organization?.id;

  // QUERIES PRINCIPALES
  const project = useQuery(api.projects.getProject, { id: projectId });
  const findings = useQuery(api.vulnerabilities.getFindings, { projectId });
  
  // --- NUEVAS QUERIES PARA BRANDING ---
  const settings = useQuery(api.settings.getSettings, orgId ? { orgId } : "skip");
  const sub = useQuery(api.subscriptions.getMySubscription, orgId ? { orgId } : "skip");
  
  // Determinamos si es Pro
  const isPro = sub?.plan === "pro" || sub?.plan === "enterprise";
  // ------------------------------------

  const createFinding = useMutation(api.vulnerabilities.createFinding);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVuln, setSelectedVuln] = useState<any>(null);

  if (!isLoaded || project === undefined || findings === undefined) {
    return (
       <div className="p-8 space-y-4">
          <Skeleton className="h-12 w-1/3 bg-zinc-800" />
          <Skeleton className="h-64 w-full bg-zinc-800" />
       </div>
    );
  }

  if (project === null) {
      return <div className="p-8 text-zinc-400">Proyecto no encontrado.</div>;
  }

  const handleCreate = async () => {
      // Limpiamos la selección para crear uno nuevo
      setSelectedVuln(null);
      
      // Creamos un borrador en la DB para obtener ID (opcional, o abrimos drawer vacío)
      // En este caso, tu Drawer maneja la creación si le pasas null? 
      // Releyendo tu Drawer, parece que necesita un vulnerability existente para editar, 
      // o maneja la creación internamente?
      // Miremos tu Drawer anterior: usa 'updateFinding'. 
      // Para crear, necesitamos llamar a createFinding primero.
      
      try {
          const newId = await createFinding({
              projectId,
              title: "Nueva Vulnerabilidad",
              description: "",
              severity: "low",
              status: "open",
          });
          
          // Buscamos el objeto completo en la lista actualizada (puede tardar unos ms en reflejarse)
          // Truco: Pasamos un objeto temporal con el ID
          setSelectedVuln({ 
              _id: newId, 
              title: "Nueva Vulnerabilidad", 
              description: "", 
              severity: "low", 
              status: "open",
              images: [] 
          });
          setIsDrawerOpen(true);
      } catch (error) {
          toast.error("Error al crear hallazgo");
      }
  };

  const openFinding = (vuln: any) => {
      setSelectedVuln(vuln);
      setIsDrawerOpen(true);
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-zinc-100">{project.name}</h1>
           <p className="text-zinc-400 mt-1">{project.description || "Sin descripción"}</p>
        </div>
        
        <div className="flex gap-2">
            {/* BOTÓN EXPORTAR PDF */}
            <PDFDownloadLink
                document={
                    <PdfReport 
                        project={project} 
                        vulnerabilities={findings} 
                        settings={settings} // <--- Pasamos configuración
                        isPro={isPro}       // <--- Pasamos estado Pro
                    />
                }
                fileName={`report-${project.name}.pdf`}
            >
                {/* @ts-ignore - ReactPDF types issue */}
                {({ loading }) => (
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white gap-2" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Exportar PDF
                    </Button>
                )}
            </PDFDownloadLink>

            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="h-4 w-4" /> Nuevo Hallazgo
            </Button>
        </div>
      </div>

      {/* GRID DE VULNERABILIDADES */}
      <div className="grid grid-cols-1 gap-4">
         {findings.length === 0 ? (
             <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
                 No hay vulnerabilidades reportadas aún.
             </div>
         ) : (
             findings.map((vuln) => (
                 <Card 
                    key={vuln._id} 
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                    onClick={() => openFinding(vuln)}
                 >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                                {vuln.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                {vuln.description || "Sin descripción..."}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className={`capitalize ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 text-xs text-zinc-500 mt-2">
                            <span>Estado: <span className="text-zinc-300 capitalize">{vuln.status.replace("_", " ")}</span></span>
                            {vuln.cvssScore ? <span>CVSS: <span className="text-zinc-300">{vuln.cvssScore}</span></span> : null}
                            <span>Imágenes: {vuln.images?.length || 0}</span>
                        </div>
                    </CardContent>
                 </Card>
             ))
         )}
      </div>

      <VulnerabilityDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        vulnerability={selectedVuln} 
      />
    </div>
  );
}