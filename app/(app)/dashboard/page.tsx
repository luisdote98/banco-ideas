import { prisma } from "@/lib/prisma";
import { Lightbulb, TrendingUp, Clock, Layers } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const [totalIdeas, ideas, categories] = await Promise.all([
    prisma.idea.count(),
    prisma.idea.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.category.findMany({
      include: { _count: { select: { ideas: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const activeCount = await prisma.idea.count({ where: { status: "ACTIVE" } });
  const incubatingCount = await prisma.idea.count({ where: { status: "INCUBATING" } });
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = await prisma.idea.count({
    where: { createdAt: { gte: todayStart } },
  });

  const stats = [
    { label: "Total ideas", value: totalIdeas, icon: Lightbulb, color: "text-violet-500" },
    { label: "Activas", value: activeCount, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Incubando", value: incubatingCount, icon: Layers, color: "text-amber-500" },
    { label: "Hoy", value: todayCount, icon: Clock, color: "text-blue-500" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Tu segundo cerebro personal</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-semibold tabular-nums">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Ideas recientes</h3>
          <Link href="/ideas" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todas →
          </Link>
        </div>
        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Lightbulb className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Aún no tienes ideas.</p>
            <Link
              href="/ideas/nueva"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Crea tu primera idea →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {idea.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
                      STATUS_COLORS[idea.status]
                    )}
                  >
                    {STATUS_LABELS[idea.status]}
                  </span>
                </div>
                {idea.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {idea.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {idea.category ? (
                    <span className="text-xs text-muted-foreground">
                      {idea.category.name}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {categories.filter((c) => c._count.ideas > 0).length > 0 && (
        <div>
          <h3 className="font-medium mb-4">Por categoría</h3>
          <div className="space-y-2">
            {categories
              .filter((c) => c._count.ideas > 0)
              .sort((a, b) => b._count.ideas - a._count.ideas)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/ideas?categoryId=${cat.id}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-xs text-muted-foreground w-28 truncate group-hover:text-foreground transition-colors">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (cat._count.ideas / Math.max(...categories.map((c) => c._count.ideas))) * 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">
                    {cat._count.ideas}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
