import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Metadata optimizada de v0
export const metadata: Metadata = {
  title: "RootReport - Pentesting Reporting Platform",
  description:
    "The pentesting reporting platform for security professionals. Streamline your security assessments with collaborative finding management and one-click reports.",
  icons: {
    icon: "/icon.svg", // Asegurate de tener este icono o borra esta línea si falla
  },
}

export const viewport: Viewport = {
  themeColor: "#09090b", // Color oscuro para móviles
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Agregamos className="dark" aquí para que funcione el modo oscuro de Shadcn
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
            <Analytics />
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}