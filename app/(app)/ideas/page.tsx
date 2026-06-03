import { prisma } from "@/lib/prisma";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeasFilters } from "@/components/ideas/IdeasFilters";
import { Lightbulb, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { IdeaWithRelations } from "@/types";

type SearchParams = {
  q?: string;
  categoryId?: string;
  status?: string;
  tagId?: string;
  orderBy?: string;
};

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { q = "", categoryId = "", status = "", tagId = "", orderBy = "createdAt_desc" } = params;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { nextStep: { contains: q } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;
  if (tagId) where.tags = { some: { tagId } };

  const [field, dir] = orderBy.split("_");
  const order = dir === "asc" ? "asc" : "desc";
  const validFields = ["createdAt", "updatedAt", "title", "scorePotential", "scoreInterest"];
  const sortField = validFields.includes(field) ? field : "createdAt";

  const [ideas, categories, tags] = await Promise.all([
    prisma.idea.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { [sortField]: order },
    }) as Promise<IdeaWithRelations[]>,
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasFilters = !!(q || categoryId || status || tagId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ideas</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
            {hasFilters ? " · filtradas" : ""}
          </p>
        </div>
        <Link href="/ideas/nueva">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva idea
          </Button>
        </Link>
      </div>

      <IdeasFilters
        categories={categories}
        tags={tags}
        currentFilters={{ q, categoryId, status, tagId, orderBy }}
      />

      {ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <Lightbulb className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
          {hasFilters ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                No hay ideas que coincidan con los filtros
              </p>
              <Link
                href="/ideas"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                Limpiar filtros
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                Aún no tienes ninguna idea guardada
              </p>
              <Link href="/ideas/nueva">
                <Button className="mt-4 gap-2" variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                  Crear primera idea
                </Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
