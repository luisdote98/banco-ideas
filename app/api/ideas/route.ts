import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const status = searchParams.get("status") ?? "";
  const tagId = searchParams.get("tagId") ?? "";
  const orderBy = searchParams.get("orderBy") ?? "createdAt_desc";

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { nextStep: { contains: q } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;
  if (tagId) where.tags = { some: { tagId } };

  const [field, dir] = orderBy.split("_");
  const order = dir === "asc" ? "asc" : "desc";
  const validFields = ["createdAt", "updatedAt", "title", "scorePotential", "scoreInterest"];
  const sortField = validFields.includes(field) ? field : "createdAt";

  const ideas = await prisma.idea.findMany({
    where,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { [sortField]: order },
  });

  return NextResponse.json(ideas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, nextStep, categoryId, status, scorePotential, scoreEffort, scoreInterest, tags, imageUrl, aiImproved } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }
  if (title.trim().length > 200) {
    return NextResponse.json({ error: "El título no puede superar los 200 caracteres" }, { status: 400 });
  }

  const validStatuses = ["DRAFT", "ACTIVE", "INCUBATING", "ARCHIVED"];
  const safeStatus = validStatuses.includes(status) ? status : "DRAFT";

  const clamp = (v: unknown, min = 1, max = 10) => {
    const n = Number(v);
    return isNaN(n) ? 5 : Math.min(max, Math.max(min, Math.round(n)));
  };

  // Resolve tags: find existing or create new
  const tagConnections: { tag: { connectOrCreate: { where: { slug: string }; create: { name: string; slug: string } } } }[] = [];
  if (Array.isArray(tags)) {
    for (const tagName of tags) {
      if (typeof tagName === "string" && tagName.trim()) {
        const slug = slugify(tagName.trim());
        tagConnections.push({
          tag: {
            connectOrCreate: {
              where: { slug },
              create: { name: tagName.trim(), slug },
            },
          },
        });
      }
    }
  }

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      nextStep: nextStep?.trim() || null,
      categoryId: categoryId || null,
      status: safeStatus,
      scorePotential: clamp(scorePotential),
      scoreEffort: clamp(scoreEffort),
      scoreInterest: clamp(scoreInterest),
      imageUrl: imageUrl || null,
      aiImproved: aiImproved === true,
      tags: { create: tagConnections },
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(idea, { status: 201 });
}
