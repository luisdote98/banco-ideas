import { prisma } from "@/lib/prisma";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Lightbulb, Search } from "lucide-react";
import Link from "next/link";
import type { IdeaWithRelations } from "@/types";
import { IdeasSearch } from "@/components/ideas/IdeasSearch";

type SearchParams = { q?: string };

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "" } = await searchParams;

  const where: Record<string, unknown> = {
    status: { not: "ARCHIVED" },
    aiProcessedAt: null,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { nextStep: { contains: q, mode: "insensitive" } },
    ];
  }

  const ideas = await prisma.idea.findMany({
    where,
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  }) as IdeaWithRelations[];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Todas las ideas</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
            {q ? ` · "${q}"` : ""}
          </p>
        </div>
      </div>

      {/* Solo búsqueda */}
      <IdeasSearch defaultValue={q} />

      {ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <Search className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
          {q ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                Sin resultados para "{q}"
              </p>
              <Link href="/ideas" className="mt-2 inline-block text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </>
          ) : (
            <>
              <Lightbulb className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                Aún no tienes ninguna idea guardada
              </p>
            </>
          )}
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
