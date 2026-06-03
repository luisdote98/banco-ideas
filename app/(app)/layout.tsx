import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [categories, inboxCount, accionesCount] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { ideas: true } } },
    }),
    prisma.idea.count({ where: { status: "DRAFT" } }),
    prisma.idea.count({ where: { nextStep: { not: null }, status: { not: "ARCHIVED" } } }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar categories={categories} inboxCount={inboxCount} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header inboxCount={inboxCount} categories={categories} />

        {/* Content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav inboxCount={inboxCount} />
    </div>
  );
}
