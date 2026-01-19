import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-500/10 p-6 rounded-full mb-6 animate-pulse">
        <ShieldAlert className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-zinc-100 mb-2 tracking-tight">404 - Breach Detected</h1>
      <p className="text-zinc-500 max-w-md mb-8">
        La ruta a la que intentas acceder no existe, ha sido eliminada o no tienes las credenciales de seguridad suficientes.
      </p>
      
      <Link href="/dashboard">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]">
          <Home className="mr-2 h-4 w-4" /> Volver a la Base
        </Button>
      </Link>
    </div>
  )
}