import { prisma } from "@/lib/prisma";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Inbox, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { IdeaWithRelations } from "@/types";

export default async function InboxPage() {
  const ideas = await prisma.idea.findMany({
    where: { status: "DRAFT" },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  }) as IdeaWithRelations[];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight">Inbox</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {ideas.length === 0
              ? "Limpio · Todo procesado"
              : `${ideas.length} ${ideas.length === 1 ? "idea sin procesar" : "ideas sin procesar"}`}
          </p>
        </div>
        <Link href="/ideas/nueva">
          <Button className="gap-2">
            <Zap className="w-4 h-4" />
            Captura rápida
          </Button>
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">El inbox está vacío</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-5">
            Captura tu próxima idea antes de que se escape
          </p>
          <Link href="/ideas/nueva">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva idea
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} showQuickActions />
          ))}
        </div>
      )}
    </div>
  );
}
