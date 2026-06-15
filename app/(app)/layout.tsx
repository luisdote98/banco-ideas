import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { ideas: true } } },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar categories={categories} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header categories={categories} />

        {/* Content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav />
    </div>
  );
}
