"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { DashboardView } from "@/components/dashboard-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { organization, isLoaded } = useOrganization();
  const orgId = organization?.id;

  // Consultas a la API
  const projects = useQuery(api.projects.listProjects, orgId ? { orgId } : "skip");
  const stats = useQuery(api.dashboard.getDashboardStats, orgId ? { orgId } : "skip");

  if (!isLoaded) {
    return <div className="p-6"><Skeleton className="h-96 w-full bg-zinc-900" /></div>;
  }

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-zinc-400">
        <p>Selecciona una organización para ver el dashboard.</p>
      </div>
    );
  }

  return (
    <DashboardView 
      projects={projects} 
      stats={stats} 
    />
  );
}