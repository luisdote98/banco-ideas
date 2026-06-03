import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { IdeaForm } from "@/components/ideas/IdeaForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { IdeaWithRelations } from "@/types";

type Params = { params: Promise<{ id: string }> };

export default async function EditarIdeaPage({ params }: Params) {
  const { id } = await params;

  const [idea, categories] = await Promise.all([
    prisma.idea.findUnique({
      where: { id },
      include: { category: true, tags: { include: { tag: true } } },
    }) as Promise<IdeaWithRelations | null>,
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!idea) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/ideas/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la idea
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight">Editar idea</h2>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{idea.title}</p>
      </div>

      <IdeaForm categories={categories} idea={idea} />
    </div>
  );
}
