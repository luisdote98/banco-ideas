import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const ideas = await prisma.idea.findMany({
    where: {
      status: { not: "ARCHIVED" },
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { nextStep: { contains: q } },
      ],
    },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return NextResponse.json(ideas);
}
