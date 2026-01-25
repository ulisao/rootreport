"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Crown, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsView() {
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const router = useRouter();

  // QUERIES
  const sub = useQuery(api.subscriptions.getMySubscription, orgId ? { orgId } : "skip");
  const settings = useQuery(api.settings.getSettings, orgId ? { orgId } : "skip");

  // MUTATIONS
  const updateColor = useMutation(api.settings.updateColor);
  const generateUploadUrl = useMutation(api.settings.generateLogoUploadUrl);
  const updateLogo = useMutation(api.settings.updateLogo);

  // ESTADOS
  const [color, setColor] = useState("#10b981"); // Default Emerald
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!sub || settings === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
      </div>
    );
  }

  const isPro = sub?.plan === "pro" || sub?.plan === "enterprise";

  // --- MANEJADORES ---

  // 1. FUNCIÓN DE CHECKOUT (Para activar el plan)
  const handleCheckout = async () => {
    if (!orgId) return;
    setIsLoadingCheckout(true);

    try {
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al iniciar checkout");
        }

        const data = await response.json();
        
        // Redirigimos a Mercado Pago
        if (data.url) {
            window.location.href = data.url;
        } else {
            toast.error("No se recibió la URL de pago");
        }

    } catch (error) {
        console.error(error);
        toast.error("Hubo un problema al conectar con Mercado Pago");
    } finally {
        // No bajamos el loading si redirige, para evitar que el usuario toque de nuevo
        // Pero si hubo error, sí lo bajamos
        setTimeout(() => setIsLoadingCheckout(false), 2000);
    }
  };

  const handleColorChange = async () => {
    if (!orgId) return;
    toast.promise(updateColor({ orgId, color }), {
        loading: "Actualizando color...",
        success: "Color de marca actualizado",
        error: "Error al guardar color"
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;

    setIsUploading(true);
    try {
        // 1. Obtener URL de subida
        const postUrl = await generateUploadUrl();
        // 2. Subir archivo a Convex Storage
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        if (!result.ok) throw new Error("Upload failed");
        const { storageId } = await result.json();
        
        // 3. Guardar ID en base de datos
        await updateLogo({ orgId, storageId });
        toast.success("Logo actualizado correctamente");
    } catch (error) {
        console.error(error);
        toast.error("Error al subir el logo");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      
      {/* 1. SECCIÓN DE PLAN */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center justify-between">
            <span>Plan Actual</span>
            <Badge variant={isPro ? "default" : "secondary"} className={isPro ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}>
                {sub?.plan === "pro" ? "AGENCY PRO" : (sub?.plan?.toUpperCase() || "FREE")}
            </Badge>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Gestiona tu suscripción y límites de la cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-500" /> 
                {isPro ? "Límite de imágenes aumentado (10 por hallazgo)" : "Límite de imágenes estándar (2 por hallazgo)"}
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-500" /> 
                {isPro ? "Personalización de Marca (Logo y Colores) ACTIVA" : "Personalización de Marca BLOQUEADA"}
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-500" /> 
                {isPro ? "Marca de agua de RootReport ELIMINADA" : "Marca de agua en reportes PDF"}
            </div>
        </CardContent>
        <CardFooter className="bg-zinc-950/50 border-t border-zinc-800 p-4">
            {!isPro ? (
                // BOTÓN CONECTADO A MERCADO PAGO
                <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleCheckout}
                    disabled={isLoadingCheckout}
                >
                    {isLoadingCheckout ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo a Mercado Pago...
                        </>
                    ) : (
                        <>
                            <Crown className="mr-2 h-4 w-4" /> Actualizar a Agency Pro ($29/mes)
                        </>
                    )}
                </Button>
            ) : (
                // BOTÓN DE GESTIÓN (PORTAL DE CLIENTE MP)
                <Button 
                    variant="outline" 
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-900"
                    onClick={() => window.open("https://www.mercadopago.com.ar/subscriptions", "_blank")}
                >
                    Gestionar o Cancelar Suscripción (Mercado Pago)
                </Button>
            )}
        </CardFooter>
      </Card>

      {/* 2. SECCIÓN DE BRANDING (Solo Pro) */}
      <div className="relative">
        {!isPro && (
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-lg border border-zinc-800">
                <Lock className="h-8 w-8 text-zinc-500 mb-2" />
                <h3 className="text-lg font-bold text-zinc-100">Funcionalidad Pro</h3>
                <p className="text-sm text-zinc-400 mb-4">Actualiza tu plan para personalizar tus reportes.</p>
                <Button size="sm" onClick={handleCheckout} disabled={isLoadingCheckout} className="bg-emerald-600 text-white">
                     Desbloquear ahora
                </Button>
            </div>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-zinc-100">Marca y Personalización</CardTitle>
                <CardDescription className="text-zinc-400">
                    Define cómo se verán tus reportes PDF exportados.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* LOGO UPLOAD */}
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-lg border border-dashed border-zinc-700 bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                            <Upload className="h-6 w-6 text-zinc-600" />
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white h-5 w-5" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Logo de la Agencia</Label>
                        <p className="text-xs text-zinc-500">Formato PNG o JPG. Recomendado 400x400px.</p>
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleLogoUpload}
                            />
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                Subir Logo
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* COLOR PICKER */}
                <div className="space-y-3">
                    <Label className="text-zinc-200">Color Primario</Label>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-zinc-700 shadow-sm" style={{ backgroundColor: color }}></div>
                        <Input 
                            type="color" 
                            className="w-20 h-10 bg-zinc-950 border-zinc-700 p-1 cursor-pointer"
                            value={settings?.primaryColor || color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                        <Button variant="ghost" onClick={handleColorChange} className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                            Guardar Color
                        </Button>
                    </div>
                    <p className="text-xs text-zinc-500">Este color se usará en los encabezados y títulos de tus reportes PDF.</p>
                </div>

            </CardContent>
        </Card>
      </div>

    </div>
  );
}