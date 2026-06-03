import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("✓ Categories seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
