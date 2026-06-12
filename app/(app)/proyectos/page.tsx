import { prisma } from "@/lib/prisma";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Rocket, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { IdeaWithRelations } from "@/types";

export default async function ProyectosPage() {
  const proyectos = await prisma.idea.findMany({
    where: { type: "PROJECT", status: { not: "ARCHIVED" } },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  }) as IdeaWithRelations[];

  const activos = proyectos.filter((p) => p.status === "ACTIVE");
  const incubando = proyectos.filter((p) => p.status === "INCUBATING");
  const borradores = proyectos.filter((p) => p.status === "DRAFT");

  const groups = [
    { label: "Activos", items: activos, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "En proceso", items: incubando, color: "text-amber-600 dark:text-amber-400" },
    { label: "Sin realizar", items: borradores, color: "text-muted-foreground" },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-violet-500" />
            <h2 className="text-2xl font-semibold tracking-tight">Proyectos</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {proyectos.length === 0 ? "Sin proyectos activos" : `${proyectos.length} proyectos`}
          </p>
        </div>
        <Link href="/ideas/nueva">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </Button>
        </Link>
      </div>

      {proyectos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950 mb-4">
            <Rocket className="w-6 h-6 text-violet-500" />
          </div>
          <p className="font-medium text-muted-foreground">Sin proyectos todavía</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-5">
            Convierte cualquier idea en proyecto desde su detalle o con el botón 🚀 en el Inbox
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${group.color}`}>
                {group.label} · {group.items.length}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.items.map((p) => (
                  <IdeaCard key={p.id} idea={p} showQuickActions />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
