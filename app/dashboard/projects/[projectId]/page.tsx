"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { useOrganization, useUser } from "@clerk/nextjs"
import dynamic from "next/dynamic" 

import { 
  Plus, 
  Search, 
  ShieldAlert, 
  Loader2,
  FileText,
  ChevronRight,
  MoreHorizontal
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Componentes Locales
import { VulnerabilityDrawer } from "@/components/vulnerability-drawer"
import { PdfReport } from "@/components/pdf-report"

// Carga dinámica del PDF
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <Button disabled><Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparando...</Button>,
  }
);

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.projectId as Id<"projects">
  
  const { organization } = useOrganization()
  const { user } = useUser()
  const orgId = organization?.id || user?.id

  // --- DATA HOOKS ---
  const project = useQuery(api.projects.getProject, { id: projectId });
  const findings = useQuery(api.vulnerabilities.getFindings, { projectId })
  const createFinding = useMutation(api.vulnerabilities.createFinding)

  // --- ESTADOS DE UI ---
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVuln, setSelectedVuln] = useState<Doc<"vulnerabilities"> | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Estado del Buscador
  const [searchQuery, setSearchQuery] = useState("")

  // Estado formulario de creación
  const [formData, setFormData] = useState({
    title: "",
    severity: "medium" as "critical" | "high" | "medium" | "low" | "info",
    description: ""
  })

  // --- HANDLERS ---

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return

    await createFinding({
      projectId,
      orgId,
      title: formData.title,
      severity: formData.severity,
      description: formData.description
    })
    
    setFormData({ title: "", severity: "medium", description: "" })
    setIsDialogOpen(false)
  }

  const handleRowClick = (vuln: Doc<"vulnerabilities">) => {
    setSelectedVuln(vuln)
    setIsDrawerOpen(true)
  }

  // --- HELPERS Y LÓGICA ---

  // Filtrado para el buscador
  const filteredFindings = findings?.filter((f) => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = {
    total: findings?.length || 0,
    critical: findings?.filter(f => f.severity === 'critical').length || 0,
    high: findings?.filter(f => f.severity === 'high').length || 0,
    medium: findings?.filter(f => f.severity === 'medium').length || 0,
    low: findings?.filter(f => f.severity === 'low').length || 0,
  }

  const getSeverityColor = (severity: string) => {
    const map: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      info: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }
    return map[severity] || map.info
  }

  // Loading State (Esperamos a Project y Findings)
  if (!findings || !project) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>

  return (
    <div className="p-6 space-y-6">
      {/* HEADER DEL PROYECTO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            {project.name}
            <Badge variant="outline" className="text-zinc-500 font-mono text-xs hidden sm:inline-flex">
                {projectId.slice(-6)}
            </Badge>
          </h1>
          <p className="text-zinc-400 mt-1">{project.description || "Sin descripción"}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Hallazgo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader><DialogTitle>Reportar Vulnerabilidad</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateFinding} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    placeholder="Ej: XSS en Buscador" 
                    className="bg-zinc-950 border-zinc-800"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severidad</Label>
                  <Select value={formData.severity} onValueChange={(v: any) => setFormData({...formData, severity: v})}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea 
                    placeholder="Detalles técnicos..." 
                    className="bg-zinc-950 border-zinc-800"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="vulnerabilities" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="report">Reporte</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">Total</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-zinc-100">{stats.total}</div></CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">Críticas</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-red-500">{stats.critical}</div></CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">Altas</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-orange-500">{stats.high}</div></CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">Medias</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-yellow-500">{stats.medium}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
            <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                        placeholder="Buscar hallazgos..." 
                        className="pl-10 bg-zinc-900 border-zinc-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                {findings.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <ShieldAlert className="mx-auto h-12 w-12 mb-3 opacity-20" />
                        <p>No hay vulnerabilidades reportadas.</p>
                        <Button 
                            variant="link" 
                            className="text-emerald-500" 
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Crear la primera
                        </Button>
                    </div>
                ) : filteredFindings.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <Search className="mx-auto h-12 w-12 mb-3 opacity-20" />
                        <p>No se encontraron resultados para "{searchQuery}".</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Severidad</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Título</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Estado</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Fecha</th>
                            <th className="w-12"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                        {filteredFindings.map((vuln) => (
                            <tr 
                                key={vuln._id} 
                                onClick={() => handleRowClick(vuln)} 
                                className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                            >
                                <td className="py-3 px-4">
                                    <Badge variant="outline" className={`${getSeverityColor(vuln.severity)} capitalize`}>
                                        {vuln.severity}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4 font-medium text-zinc-200 group-hover:text-emerald-400">
                                    {vuln.title}
                                </td>
                                <td className="py-3 px-4">
                                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 capitalize">
                                        {vuln.status}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-zinc-500">
                                    {new Date(vuln._creationTime).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500" />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="report">
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle>Reporte de Auditoría</CardTitle>
                    <CardDescription>Genera un PDF profesional con los {stats.total} hallazgos actuales.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="bg-zinc-950 p-6 rounded-full border border-zinc-800">
                      <FileText className="h-12 w-12 text-emerald-500" />
                    </div>
                    
                    <div className="text-center max-w-md space-y-2">
                      <h3 className="text-lg font-medium text-zinc-100">Listo para exportar</h3>
                      <p className="text-zinc-400 text-sm">
                        El reporte incluirá una portada con el nombre <strong>"{project.name}"</strong>, el resumen ejecutivo y el detalle técnico.
                      </p>
                    </div>
                    
                    {findings.length > 0 ? (
                      <PDFDownloadLink
                        document={<PdfReport projectName={project.name} findings={findings} />}
                        // Nombre limpio para el archivo (ej: Reporte_Pentest_Banco.pdf)
                        fileName={`Reporte_${project.name.replace(/\s+/g, '_')}.pdf`}
                      >
                        {/* @ts-ignore */}
                        {({ blob, url, loading, error }: any) => (
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...
                              </>
                            ) : (
                              <>
                                Descargar Reporte PDF
                              </>
                            )}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <Button disabled variant="secondary">Agrega hallazgos para generar</Button>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <VulnerabilityDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        vulnerability={selectedVuln} 
      />
    </div>
  )
}