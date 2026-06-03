import { prisma } from "@/lib/prisma";
import { ArrowRight, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";
import { timeAgo, scoreCompuesto, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function AccionesPage() {
  const ideas = await prisma.idea.findMany({
    where: {
      nextStep: { not: null },
      status: { not: "ARCHIVED" },
    },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  // Sort: ACTIVE first, then INCUBATING, then DRAFT
  const statusOrder = { ACTIVE: 0, INCUBATING: 1, DRAFT: 2 };
  const sorted = [...ideas].sort(
    (a, b) => (statusOrder[a.status as keyof typeof statusOrder] ?? 3) - (statusOrder[b.status as keyof typeof statusOrder] ?? 3)
  );

  const byStatus = {
    ACTIVE: sorted.filter((i) => i.status === "ACTIVE"),
    INCUBATING: sorted.filter((i) => i.status === "INCUBATING"),
    DRAFT: sorted.filter((i) => i.status === "DRAFT"),
  };

  const groups = [
    { key: "ACTIVE", label: "Activas", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    { key: "INCUBATING", label: "Incubando", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    { key: "DRAFT", label: "Borradores", color: "text-muted-foreground", dot: "bg-zinc-400" },
  ].filter((g) => byStatus[g.key as keyof typeof byStatus].length > 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Acciones pendientes</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {ideas.length === 0 ? "Sin acciones pendientes" : `${ideas.length} ideas con próximo paso definido`}
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground">Sin acciones pendientes</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Añade un "Próximo paso" a tus ideas desde su vista de detalle
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const items = byStatus[group.key as keyof typeof byStatus];
            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-2 h-2 rounded-full", group.dot)} />
                  <h3 className={cn("text-xs font-semibold uppercase tracking-wider", group.color)}>
                    {group.label} · {items.length}
                  </h3>
                </div>
                <div className="space-y-2">
                  {items.map((idea) => {
                    const score = scoreCompuesto(idea.scorePotential, idea.scoreEffort, idea.scoreInterest);
                    return (
                      <Link
                        key={idea.id}
                        href={`/ideas/${idea.id}`}
                        className="flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                      >
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-1">
                            {idea.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {idea.nextStep}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pt-0.5">
                          {idea.category && (
                            <span
                              className="hidden sm:inline text-xs px-2 py-0.5 rounded-full"
                              style={{ color: idea.category.color, backgroundColor: `${idea.category.color}18` }}
                            >
                              {idea.category.name}
                            </span>
                          )}
                          <StatusBadge status={idea.status} />
                          <div className="text-xs text-muted-foreground tabular-nums w-6 text-right">
                            {score.toFixed(0)}
                          </div>
                          <span className="hidden md:block text-xs text-muted-foreground/60 w-20 text-right">
                            {timeAgo(idea.updatedAt)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ideas.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Inbox className="w-3.5 h-3.5" />
          <Link href="/inbox" className="hover:text-foreground transition-colors">
            Ver ideas sin acción definida en Inbox →
          </Link>
        </div>
      )}
    </div>
  );
}
