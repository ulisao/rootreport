"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import {
  Shield,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings, // Iconos comentados por ahora
  Bell,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- NAVEGACIÓN LIMPIA (MVP) ---
// Comenté las páginas que aún no existen para evitar errores 404.
// Descomentalas a medida que vayas creando los archivos en 'app/dashboard/...'
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Proyectos", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Tareas", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Equipo", href: "/dashboard/team", icon: Users },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Breadcrumbs Logic
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
      href: "/" + paths.slice(0, index + 1).join("/"),
      current: index === paths.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 z-40",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-800 justify-center sm:justify-start">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden"
          >
            <Shield className="h-8 w-8 text-emerald-500 shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-lg font-bold whitespace-nowrap">
                RootReport
              </span>
            )}
          </Link>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                  sidebarCollapsed && "justify-center",
                )}
                title={sidebarCollapsed ? item.name : ""}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar (Usuario) */}
        <div
          className={cn(
            "p-4 border-t border-zinc-800 flex items-center gap-3",
            sidebarCollapsed && "justify-center px-2",
          )}
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8",
                userButtonBox: "flex-row-reverse",
              },
            }}
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-zinc-100 truncate">
                {user?.fullName || user?.username || "Usuario"}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "ml-16" : "ml-64",
        )}
      >
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>

            {/* Breadcrumbs (Navegación superior) */}
            <nav className="flex items-center gap-2 text-sm hidden sm:flex">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  )}
                  {crumb.current ? (
                    <span className="text-zinc-100 font-medium">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Switcher de Organización */}
            <OrganizationSwitcher
              hidePersonal
              // ESTO ES CLAVE: Redirige a TU página donde ya ocultamos cosas
              organizationProfileUrl="/dashboard/team"
              appearance={{
                elements: {
                  rootBox: "flex w-full",
                  organizationPreviewMainIdentifier:
                    "text-zinc-200 font-medium",
                  organizationPreviewSecondaryIdentifier: "text-zinc-400",
                },
              }}
            />

            {/* Notificaciones (Sin el globo rojo falso) */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-zinc-100"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Contenido de la Página */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
