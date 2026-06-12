import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Marca un conjunto de ideas como ya procesadas por IA
export async function POST(req: NextRequest) {
  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "IDs requeridos" }, { status: 400 });
  }

  await prisma.idea.updateMany({
    where: { id: { in: ids } },
    data: { aiImproved: true },
  });

  return NextResponse.json({ ok: true, marked: ids.length });
}
