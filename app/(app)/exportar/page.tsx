import { prisma } from "@/lib/prisma";
import { ExportImportClient } from "@/components/ideas/ExportImportClient";

export default async function ExportarPage() {
  const ideas = await prisma.idea.findMany({
    where: {
      status: { not: "ARCHIVED" },
      aiImproved: false,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ExportImportClient ideas={ideas} />;
}
