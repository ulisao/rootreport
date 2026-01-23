"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProLockProps {
  featureName: string;
  description?: string;
}

export function ProLockScreen({ 
  featureName, 
  description = "Esta funcionalidad es exclusiva para usuarios con planes Agency Pro o Enterprise." 
}: ProLockProps) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-zinc-900/50 border-zinc-800 p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        
        {/* Efecto de fondo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10 bg-zinc-950 p-4 rounded-full border border-zinc-800 shadow-xl shadow-emerald-900/20">
          <Lock className="h-8 w-8 text-emerald-500" />
        </div>

        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-bold text-zinc-100">
            {featureName}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="w-full relative z-10 pt-2">
          <Link href="/dashboard/settings" passHref className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]">
              <Zap className="mr-2 h-4 w-4 fill-current" />
              Actualizar a Pro
            </Button>
          </Link>
          <p className="text-xs text-zinc-600 mt-4">
            Desbloquea límites infinitos y herramientas avanzadas.
          </p>
        </div>
      </Card>
    </div>
  );
}