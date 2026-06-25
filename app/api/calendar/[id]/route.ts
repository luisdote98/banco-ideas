import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, color } = await req.json();

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(title?.trim() && { title: title.trim() }),
      ...(color && { color }),
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.calendarEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
