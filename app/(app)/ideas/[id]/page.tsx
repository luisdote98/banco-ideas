import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IdeaDetailClient } from "@/components/ideas/IdeaDetailClient";

type Params = { params: Promise<{ id: string }> };

export default async function IdeaDetailPage({ params }: Params) {
  const { id } = await params;

  const [idea, categories] = await Promise.all([
    prisma.idea.findUnique({
      where: { id },
      include: { category: true, tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!idea) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/inbox"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <IdeaDetailClient idea={idea} categories={categories} />
    </div>
  );
}
