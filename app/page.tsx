'use client'

import { Authenticated, Unauthenticated } from 'convex/react'
import { LandingPage } from "@/components/landing-page"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* 1. Si está autenticado, lo mandamos al Dashboard */}
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>

      {/* 2. Si NO está autenticado, mostramos la Landing Page hermosa de v0 */}
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </>
  )
}

// Pequeño componente helper para hacer la redirección
function RedirectToDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  // Mostramos un spinner de carga mientras redirige para que sea suave
  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <span className="ml-2 text-zinc-400">Entrando a la base...</span>
    </div>
  )
}