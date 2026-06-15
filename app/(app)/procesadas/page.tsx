import { prisma } from "@/lib/prisma";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Sparkles } from "lucide-react";
import type { IdeaWithRelations } from "@/types";

export default async function ProcesadasPage() {
  const ideas = await prisma.idea.findMany({
    where: { aiProcessedAt: { not: null } },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { aiProcessedAt: "desc" },
  }) as IdeaWithRelations[];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h2 className="text-2xl font-semibold tracking-tight">Ideas procesadas</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {ideas.length === 0
            ? "Sin ideas procesadas todavía"
            : `${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"} mejoradas e importadas desde la IA — revísalas y elimina las que ya no necesites`}
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">
            Aún no hay ideas procesadas
          </p>
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
