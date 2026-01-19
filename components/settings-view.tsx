"use client"

import { useOrganization, useUser, OrganizationProfile } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { 
  CreditCard, 
  Users, 
  Check, 
  Loader2, 
  Zap,
  ExternalLink
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsView() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { user, isLoaded: isUserLoaded } = useUser()
  
  // Detectar si es PRO mirando los metadatos (Igual que el backend)
  const isPro = (user?.publicMetadata as { plan?: string })?.plan === "enterprise"

  // Traemos los proyectos reales
  const projects = useQuery(api.projects.getProjects, organization?.id ? { orgId: organization.id } : "skip")
  
  // Calculamos uso real
  const projectUsage = projects?.length || 0
  const maxProjects = isPro ? "∞" : 3 // Infinito si es pro
  
  // Cálculo de porcentaje para la barra (si es infinito ponemos 100% o algo visual)
  const usagePercentage = isPro 
    ? 100 // Barra llena pero verde si es pro
    : Math.min((projectUsage / 3) * 100, 100)

  const handleUpgrade = () => {
    // AQUÍ IRÍA LA REDIRECCIÓN A STRIPE
    // window.location.href = "https://buy.stripe.com/..."
    
    // Por ahora, simulamos o avisamos
    alert("🔗 Redirigiendo a pasarela de pago (Simulación)...\n\nPara probar PRO en dev, edita los metadatos en Clerk Dashboard.")
  }

  const handleManageSubscription = () => {
    alert("🔗 Abriendo portal de cliente de Stripe...")
  }

  if (!isOrgLoaded || !isUserLoaded) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Configuración</h1>
        <p className="text-zinc-400 mt-1">Gestiona tu equipo, facturación y preferencias.</p>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Equipo y Organización
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Facturación
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EQUIPO */}
        <TabsContent value="team" className="space-y-6">
            <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                <OrganizationProfile 
                    routing="hash"
                    appearance={{
                        elements: {
                            rootBox: "w-full h-full",
                            card: "w-full h-full shadow-none border-0 bg-transparent text-zinc-100",
                            navbar: "hidden",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                            formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700",
                            formFieldInput: "bg-zinc-950 border-zinc-800 text-zinc-100",
                            userPreviewMainIdentifier: "text-zinc-200 font-semibold",
                            userPreviewSecondaryIdentifier: "text-zinc-400",
                            organizationPreviewMainIdentifier: "text-zinc-200",
                        }
                    }}
                />
            </div>
        </TabsContent>

        {/* TAB 2: BILLING */}
        <TabsContent value="billing" className="space-y-6">
          {/* Tarjeta de Estado del Plan */}
          <Card className={`bg-zinc-900 border ${isPro ? "border-emerald-500/50" : "border-zinc-800"}`}>
            <CardHeader>
              <CardTitle className="text-zinc-100">Plan Actual</CardTitle>
              <CardDescription className="text-zinc-500">Estado de tu suscripción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-100">
                        {isPro ? "Plan Agency (Premium)" : "Plan Freelancer (Gratis)"}
                    </h3>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10">Activo</Badge>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {isPro ? "Facturación mensual de $30" : "Gratis para siempre • Hasta 3 proyectos"}
                  </p>
                </div>
                {isPro && (
                    <Button variant="ghost" onClick={handleManageSubscription} className="text-zinc-400 hover:text-white">
                        Gestionar <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                )}
              </div>

              {/* Uso Real de Proyectos */}
              <div className="space-y-4">
                <h4 className="font-medium text-zinc-100">Uso de Recursos</h4>
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Proyectos Activos</span>
                      <span className="text-sm text-zinc-100">{projectUsage} / {maxProjects}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2 bg-zinc-800" />
                    {!isPro && projectUsage >= 3 && (
                        <p className="text-xs text-red-400 mt-2">Has alcanzado el límite gratuito.</p>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparativa de Planes */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Planes Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Freelancer */}
                <div className={`p-4 border rounded-lg ${!isPro ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-800 opacity-50"}`}>
                    <div className="flex justify-between">
                        <h4 className="font-medium text-zinc-100">Freelancer</h4>
                        {!isPro && <Badge className="bg-emerald-600">Tu Plan</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-zinc-100 mt-2">Gratis</p>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-sm text-zinc-400"><Check className="h-4 w-4 text-emerald-500" />3 proyectos</li>
                        <li className="flex items-center gap-2 text-sm text-zinc-400"><Check className="h-4 w-4 text-emerald-500" />Reportes PDF</li>
                    </ul>
                </div>

                {/* Agency Pro */}
                <div className={`p-4 border rounded-lg transition-colors ${isPro ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-800 hover:border-emerald-500/30"}`}>
                  <div className="flex justify-between">
                        <h4 className="font-medium text-zinc-100">Agency Pro</h4>
                        {isPro && <Badge className="bg-emerald-600">Tu Plan</Badge>}
                  </div>
                  <p className="text-2xl font-bold text-zinc-100 mt-2">
                    $30<span className="text-sm font-normal text-zinc-500">/mes</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="h-4 w-4 text-emerald-500" />
                      Proyectos <strong>Ilimitados</strong>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="h-4 w-4 text-emerald-500" />
                      Soporte Prioritario
                    </li>
                  </ul>
                  
                  {!isPro ? (
                      <Button onClick={handleUpgrade} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Zap className="mr-2 h-4 w-4" /> Actualizar a PRO
                      </Button>
                  ) : (
                      <Button disabled className="w-full mt-4 bg-zinc-800 text-zinc-400">Plan Actual</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}