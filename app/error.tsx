"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-yellow-500/10 p-6 rounded-full mb-6">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-2">Error del Sistema</h2>
      <p className="text-zinc-500 max-w-md mb-8">
        Algo salió mal al procesar tu solicitud. El incidente ha sido registrado en nuestros logs.
      </p>
      <Button 
        onClick={() => reset()}
        variant="outline"
        className="border-zinc-700 text-zinc-300 hover:bg-zinc-900"
      >
        <RefreshCcw className="mr-2 h-4 w-4" /> Reintentar Conexión
      </Button>
    </div>
  )
}