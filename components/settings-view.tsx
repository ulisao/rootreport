"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, Crown } from "lucide-react";
import { useOrganization, useUser } from "@clerk/nextjs";

export function SettingsView() {
  const [loading, setLoading] = useState(false);
  const { organization } = useOrganization();
  const { user } = useUser();

  // Lógica de detección de plan (igual que en Projects)
  const orgMetadata = organization?.publicMetadata as { plan?: string };
  const userMetadata = user?.publicMetadata as { plan?: string };
  const isPro = orgMetadata?.plan === "enterprise" || userMetadata?.plan === "enterprise";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Llamamos a nuestra API para crear el link de suscripción
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        // Redirigimos a Mercado Pago
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar el pago. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const contactEmail = "ventas@rootreport.com"; // Cambia esto por tu email real

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100">Planes y Facturación</h2>
          <p className="text-zinc-400">Gestiona tu suscripción y límites.</p>
        </div>

        {/* Grilla de 3 Columnas */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* PLAN FREE */}
          <Card className={`bg-zinc-900 border-zinc-800 h-full flex flex-col ${!isPro ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : ""}`}>
            <CardHeader>
              <CardTitle className="text-zinc-100 flex justify-between items-center">
                Freelancer
                {!isPro && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">Plan Actual</Badge>}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Para empezar a auditar.
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-zinc-100">Gratis</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
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

          {/* PLAN PRO (Destacado con botón de pago) */}
          <Card className={`bg-zinc-900 border-zinc-800 relative overflow-visible shadow-xl shadow-emerald-900/10 md:scale-105 z-10 h-full flex flex-col ${isPro ? "border-emerald-500 ring-1 ring-emerald-500/50" : ""}`}>
            {!isPro && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-max">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Recomendado
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-zinc-100 flex justify-between items-center">
                Agency Pro
                {isPro && <Badge className="bg-emerald-500 text-white hover:bg-emerald-600"><Crown className="w-3 h-3 mr-1"/> Activo</Badge>}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Para profesionales serios.
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-zinc-100">$49.000</span>
                <span className="text-zinc-400 ml-2">ARS/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {[
                  "Proyectos Ilimitados",
                  "Reportes Personalizados",
                  "Soporte Prioritario",
                  "Colaboración en Equipo",
                ].map((feature) => (
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

          {/* PLAN ENTERPRISE */}
          <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-zinc-100">Enterprise</CardTitle>
              <CardDescription className="text-zinc-400">
                Para grandes equipos.
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-zinc-100">Custom</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {[
                  "Todo lo de Pro",
                  "SSO & SAML",
                  "Contrato de SLA",
                  "Instancia Privada (On-prem)",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <a href={`mailto:${contactEmail}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                >
                  Contactar Ventas
                </Button>
              </a>
            </CardFooter>
          </Card>

        </div>
        
        {isPro && (
          <p className="text-center text-zinc-500 text-sm mt-8">
            Para cancelar tu suscripción, contacta a soporte o gestiona tus pagos en Mercado Pago.
          </p>
        )}
      </div>
    </div>
  );
}