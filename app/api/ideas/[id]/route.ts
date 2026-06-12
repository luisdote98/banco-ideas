import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

const TRACKED_FIELDS = ["title", "description", "status", "nextStep", "categoryId", "type"] as const;
type TrackedField = typeof TRACKED_FIELDS[number];

async function recordHistory(
  ideaId: string,
  existing: Record<string, unknown>,
  updates: Record<string, unknown>
) {
  const entries: { ideaId: string; field: string; oldValue: string | null; newValue: string | null }[] = [];

  for (const field of TRACKED_FIELDS) {
    if (field in updates && String(updates[field] ?? "") !== String(existing[field as TrackedField] ?? "")) {
      entries.push({
        ideaId,
        field,
        oldValue: existing[field as TrackedField] != null ? String(existing[field as TrackedField]) : null,
        newValue: updates[field] != null ? String(updates[field]) : null,
      });
    }
  }

  if (entries.length > 0) {
    await prisma.ideaHistory.createMany({ data: entries });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      history: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const {
    title, description, nextStep, categoryId, status, type,
    scorePotential, scoreEffort, scoreInterest, tags, imageUrl,
  } = body;

  const existing = await prisma.idea.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const validStatuses = ["DRAFT", "ACTIVE", "INCUBATING", "ARCHIVED"];
  const validTypes = ["IDEA", "PROJECT"];
  const clamp = (v: unknown) => {
    const n = Number(v);
    return isNaN(n) ? undefined : Math.min(10, Math.max(1, Math.round(n)));
  };

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (nextStep !== undefined) data.nextStep = nextStep?.trim() || null;
  if (categoryId !== undefined) data.categoryId = categoryId || null;
  if (status !== undefined && validStatuses.includes(status)) data.status = status;
  if (type !== undefined && validTypes.includes(type)) data.type = type;
  if (scorePotential !== undefined) data.scorePotential = clamp(scorePotential);
  if (scoreEffort !== undefined) data.scoreEffort = clamp(scoreEffort);
  if (scoreInterest !== undefined) data.scoreInterest = clamp(scoreInterest);
  if (imageUrl !== undefined) data.imageUrl = imageUrl;

  // Record history before updating
  await recordHistory(id, existing as Record<string, unknown>, data);

  if (Array.isArray(tags)) {
    await prisma.tagsOnIdeas.deleteMany({ where: { ideaId: id } });
    for (const tagName of tags) {
      if (typeof tagName === "string" && tagName.trim()) {
        const slug = slugify(tagName.trim());
        const tag = await prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name: tagName.trim(), slug },
        });
        await prisma.tagsOnIdeas.upsert({
          where: { ideaId_tagId: { ideaId: id, tagId: tag.id } },
          update: {},
          create: { ideaId: id, tagId: tag.id },
        });
      }
    }
  }

  const idea = await prisma.idea.update({
    where: { id },
    data,
    include: {
      category: true,
      tags: { include: { tag: true } },
      history: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  return NextResponse.json(idea);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.idea.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.idea.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
