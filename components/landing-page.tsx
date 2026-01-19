"use client";

import Link from "next/link";
import {
  Shield,
  Zap,
  Users,
  FileText,
  Check,
  ArrowRight,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reemplazá esto con tu email real
  const contactEmail = "soporte@rootreport.app";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 scroll-smooth">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold">RootReport</span>
            </div>

            {/* Menú Desktop Limpio */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Características
              </a>
              <a
                href="#pricing"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Precios
              </a>
              {/* Ocultamos Documentación por ahora */}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  Ingresar
                </Button>
              </SignInButton>

              <SignInButton mode="modal">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Empezar Gratis
                </Button>
              </SignInButton>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-4">
            <a
              href="#features"
              className="block text-sm text-zinc-400 hover:text-zinc-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Características
            </a>
            <a
              href="#pricing"
              className="block text-sm text-zinc-400 hover:text-zinc-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Precios
            </a>
            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" className="w-full text-zinc-400">
                  Ingresar
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Empezar Gratis
                </Button>
              </SignInButton>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8">
            <Zap className="h-4 w-4" />
            La plataforma para Pentesters Modernos
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
            Reportes de Pentesting{" "}
            <span className="text-emerald-400">Profesionales</span> en minutos
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 text-pretty">
            Gestiona hallazgos, colabora con tu equipo y genera reportes PDF
            automáticos. Olvídate de luchar con documentos de Word.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                Contratar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignInButton>

            {/* View Demo ahora baja a Features en lugar de ser un link roto */}
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                Ver Características
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Todo lo que necesitas para reportar
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Creado por pentesters, para pentesters.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">
                  Colaboración Real
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Trabaja en equipo sobre los mismos hallazgos sin conflictos de
                  versiones.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">Reportes PDF</CardTitle>
                <CardDescription className="text-zinc-400">
                  Genera documentos PDF profesionales listos para enviar al
                  cliente con un solo clic.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-zinc-100">
                  Gestión de Proyectos
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Organiza múltiples auditorías y mantén el control de tus
                  clientes y estados.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        {" "}
        {/* Aumenté el padding vertical (py-24) para dar aire */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Precios Transparentes
            </h2>
            <p className="text-zinc-400 text-lg">
              Empieza gratis, crece cuando lo necesites.
            </p>
          </div>

          {/* Agregamos items-start para que se alineen bien arriba */}
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Freelancer */}
            <Card className="bg-zinc-900 border-zinc-800 h-full">
              {" "}
              {/* h-full para igualar alturas */}
              <CardHeader>
                <CardTitle className="text-zinc-100">Freelancer</CardTitle>
                <CardDescription className="text-zinc-400">
                  Para consultores individuales
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-zinc-100">
                    Gratis
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "3 Proyectos Activos",
                    "Reportes PDF Básicos",
                    "Soporte Comunitario",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-zinc-400"
                    >
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                  >
                    Empezar Ahora
                  </Button>
                </SignInButton>
              </CardFooter>
            </Card>

            {/* Agency - Popular (CORREGIDO) */}
            {/* 1. overflow-visible: Permite que el badge salga de la caja */}
            {/* 2. scale-105: La hace un 5% más grande para destacar */}
            {/* 3. z-10: Se asegura que esté por encima de las otras */}
            <Card className="bg-zinc-900 border-emerald-500 relative overflow-visible shadow-2xl shadow-emerald-900/20 md:scale-105 z-10 h-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-max">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Más Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-zinc-100">Pro</CardTitle>
                <CardDescription className="text-zinc-400">
                  Para profesionales serios
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-zinc-100">$30</span>
                  <span className="text-zinc-400">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Proyectos Ilimitados",
                    "Reportes Personalizados",
                    "Soporte Prioritario",
                    "Colaboración en Equipo",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-zinc-400"
                    >
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <SignInButton mode="modal">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                    Contratar ahora
                  </Button>
                </SignInButton>
              </CardFooter>
            </Card>

            {/* Enterprise */}
            <Card className="bg-zinc-900 border-zinc-800 h-full">
              <CardHeader>
                <CardTitle className="text-zinc-100">Enterprise</CardTitle>
                <CardDescription className="text-zinc-400">
                  Para grandes equipos
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-zinc-100">
                    Custom
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Todo lo de Pro",
                    "SSO & SAML",
                    "Contrato de SLA",
                    "Instancia Privada (On-prem)",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-zinc-400"
                    >
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
        </div>
      </section>

      {/* Footer Limpio */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-500" />
              <span className="font-bold">RootReport</span>
            </div>

            {/* Links eliminados por ahora, dejamos solo el contacto real */}
            <div className="flex items-center gap-8 text-sm text-zinc-400">
              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-zinc-100 transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" /> Soporte
              </a>
            </div>

            <p className="text-sm text-zinc-500">© 2026 RootReport.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
