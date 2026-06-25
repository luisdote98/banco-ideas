import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  ?? "0");
  const month = parseInt(searchParams.get("month") ?? "0"); // 0-indexed

  if (!year || isNaN(month)) {
    return NextResponse.json({ error: "year y month requeridos" }, { status: 400 });
  }

  const from = new Date(year, month, 1);
  const to   = new Date(year, month + 1, 1);

  const events = await prisma.calendarEvent.findMany({
    where: { date: { gte: from, lt: to } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const { title, date, color } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Título requerido" }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title: title.trim(),
      date: new Date(date),
      color: color ?? "#6366f1",
    },
  });

  return NextResponse.json(event, { status: 201 });
}
