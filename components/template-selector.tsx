"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Book, Search, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TemplateSelectorProps {
  onSelect: (template: any) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const templates = useQuery(api.library.listTemplates, orgId ? { orgId } : "skip");

  const filtered = templates?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (t: any) => {
    onSelect(t); // Le pasamos la data al formulario padre
    setIsOpen(false); // Cerramos el modal
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed border-zinc-700 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50">
          <Book className="h-4 w-4" />
          Importar de Librería
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla</DialogTitle>
        </DialogHeader>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar vulnerabilidad..." 
            className="pl-10 bg-zinc-900 border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="flex flex-col gap-2">
            {!templates ? (
               <div className="flex justify-center p-4"><Loader2 className="animate-spin text-emerald-500"/></div>
            ) : filtered?.length === 0 ? (
               <p className="text-center text-zinc-500 py-8">No se encontraron plantillas.</p>
            ) : (
              filtered?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => handleSelect(t)}
                  className="flex flex-col items-start gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-emerald-500/50 transition-all text-left group"
                >
                  <div className="flex w-full justify-between items-start">
                    <span className="font-medium text-sm group-hover:text-emerald-400 transition-colors">
                        {t.title}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getSeverityColor(t.severity)}`}>
                        {t.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {t.description}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}