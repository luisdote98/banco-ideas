import { prisma } from "@/lib/prisma";
import { ExportImportClient } from "@/components/ideas/ExportImportClient";

export default async function ExportarPage() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const ideas = await prisma.idea.findMany({
    where: {
      createdAt: { gte: startOfWeek },
      status: { not: "ARCHIVED" },
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ExportImportClient ideas={ideas} />;
}
