"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function TeamPage() {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Gestión de Equipo</h1>
        <p className="text-zinc-400">
          Invita miembros, gestiona roles y configura tu organización.
        </p>
      </div>

      <div className="flex justify-center">
        <OrganizationProfile 
          path="/dashboard/team"
          routing="path"
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
            elements: {
              rootBox: "w-full max-w-full",
              card: "bg-zinc-900 border border-zinc-800 shadow-none w-full",
              navbar: "hidden", 
              navbarMobileMenuButton: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              viewSectionTitle: "text-zinc-100 font-bold",
              viewSectionSubtitle: "text-zinc-400",
              item: "text-zinc-300 hover:bg-zinc-800",
              item__active: "bg-zinc-800 text-zinc-100",
              formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
              
              // CLASES FORZADAS PARA OCULTAR BILLING
              navbarButton__billing: "!hidden",
              profileSection__billing: "!hidden",
              menuItem__billing: "!hidden"
            }
          }}
        />
      </div>
    </div>
  );
}