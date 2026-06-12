import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, nextStep, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Título requerido" }, { status: 400 });
  }

  // Buscar idea original por título (similaridad flexible)
  const cleanTitle = title.trim().toLowerCase();

  const candidates = await prisma.idea.findMany({
    where: { aiImproved: false },
    select: { id: true, title: true },
  });

  // Intentar match: título original contenido en el nuevo o viceversa
  const match = candidates.find((c) => {
    const ct = c.title.toLowerCase();
    return ct === cleanTitle || cleanTitle.includes(ct) || ct.includes(cleanTitle);
  });

  if (match) {
    // Actualizar la idea original con el contenido mejorado
    const updated = await prisma.idea.update({
      where: { id: match.id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        nextStep: nextStep?.trim() || null,
        status: status || undefined,
        aiImproved: true,
      },
    });
    return NextResponse.json({ idea: updated, action: "updated" });
  }

  // Si no hay match, crear nueva idea marcada como mejorada por IA
  const created = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      nextStep: nextStep?.trim() || null,
      status: status || "DRAFT",
      scorePotential: 5,
      scoreEffort: 5,
      scoreInterest: 5,
      aiImproved: true,
    },
  });
  return NextResponse.json({ idea: created, action: "created" });
}
