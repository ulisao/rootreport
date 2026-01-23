"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, Crown } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api"; // Asegurate que el import sea correcto

export function SettingsView() {
  const [loading, setLoading] = useState(false);
  const { organization } = useOrganization();
  
  // 1. LEEMOS LA SUSCRIPCIÓN DESDE CONVEX (Fuente de verdad)
  const subscription = useQuery(api.subscriptions.getMySubscription, 
    organization?.id ? { orgId: organization.id } : "skip"
  );

  // 2. DETERMINAMOS SI ES PRO
  // Si no cargó todavía (undefined), asumimos false visualmente para no flashear
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  const handleUpgrade = async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      // Aquí llamaremos a tu API de Next.js que habla con Mercado Pago
      // Le pasamos el orgId para saber a quién activar luego
      const res = await fetch("/api/checkout", { 
        method: "POST",
        body: JSON.stringify({ orgId: organization.id }) 
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar el pago.");
    } finally {
      setLoading(false);
    }
  };

  const contactEmail = "ventas@rootreport.com"; 

  // Si subscription es undefined, es que está cargando
  if (subscription === undefined) {
      return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100">Planes y Facturación</h2>
          <p className="text-zinc-400">Gestiona tu suscripción para la organización: <span className="text-emerald-400">{organization?.name}</span></p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* PLAN FREE */}
          <Card className={`bg-zinc-900 border-zinc-800 h-full flex flex-col ${!isPro ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : ""}`}>
            <CardHeader>
              <CardTitle className="text-zinc-100 flex justify-between items-center">
                Freelancer
                {!isPro && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">Plan Actual</Badge>}
              </CardTitle>
              {/* ... resto del card igual ... */}
            </CardHeader>
            <CardContent className="flex-1">
               {/* ... items ... */}
               <ul className="space-y-3">
                {["3 Proyectos Activos", "Reportes PDF Básicos", "Soporte Comunitario"].map(
                  (feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  )
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled className="w-full border-zinc-700 text-zinc-500 bg-transparent cursor-not-allowed">
                {isPro ? "Incluido en Pro" : "Plan Actual"}
              </Button>
            </CardFooter>
          </Card>

          {/* PLAN PRO */}
          <Card className={`bg-zinc-900 border-zinc-800 relative overflow-visible shadow-xl shadow-emerald-900/10 md:scale-105 z-10 h-full flex flex-col ${isPro ? "border-emerald-500 ring-1 ring-emerald-500/50" : ""}`}>
            {/* ... Badge Recomendado ... */}
            <CardHeader>
              <CardTitle className="text-zinc-100 flex justify-between items-center">
                Agency Pro
                {isPro && <Badge className="bg-emerald-500 text-white hover:bg-emerald-600"><Crown className="w-3 h-3 mr-1"/> Activo</Badge>}
              </CardTitle>
              <CardDescription className="text-zinc-400">Para profesionales serios.</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-zinc-100">$49.000</span>
                <span className="text-zinc-400 ml-2">ARS/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {[ "Proyectos Ilimitados", "Reportes Personalizados", "Soporte Prioritario", "Colaboración en Equipo"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isPro ? (
                <Button disabled className="w-full bg-zinc-800 text-emerald-500 font-medium cursor-not-allowed">
                    <Check className="mr-2 h-4 w-4" /> Suscripción Activa
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 h-12 text-base"
                >
                  {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Zap className="mr-2 h-5 w-5" />}
                  Actualizar a Pro
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* PLAN ENTERPRISE (Igual) */}
          <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
             {/* ... contenido enterprise ... */}
              <CardHeader>
              <CardTitle className="text-zinc-100">Enterprise</CardTitle>
              <div className="mt-4"><span className="text-4xl font-bold text-zinc-100">Custom</span></div>
            </CardHeader>
             <CardContent className="flex-1">
              <ul className="space-y-3">
                {["Todo lo de Pro", "SSO & SAML", "Contrato de SLA"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <a href={`mailto:${contactEmail}`} className="w-full">
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">Contactar Ventas</Button>
              </a>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}