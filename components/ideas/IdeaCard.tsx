"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Rocket, Archive, Zap, RotateCcw, Loader2 } from "lucide-react";
import { cn, scoreCompuesto, timeAgo } from "@/lib/utils";
import { TagPill } from "@/components/shared/TagPill";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { IdeaWithRelations } from "@/types";

type Props = {
  idea: IdeaWithRelations;
  showQuickActions?: boolean;
};

export function IdeaCard({ idea, showQuickActions = false }: Props) {
  const router = useRouter();
  const score = scoreCompuesto(idea.scorePotential, idea.scoreEffort, idea.scoreInterest);
  const [acting, setActing] = useState<string | null>(null);

  const quickAction = async (e: React.MouseEvent, action: string, payload: object) => {
    e.preventDefault();
    e.stopPropagation();
    setActing(action);
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success(
        action === "activate" ? "Marcada como Activa" :
        action === "archive" ? "Archivada" :
        action === "restore" ? "Restaurada" :
        action === "project" ? "Convertida a Proyecto" : "Actualizada"
      );
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setActing(null);
    }
  };

  const isArchived = idea.status === "ARCHIVED";
  const isProject = idea.type === "PROJECT";

  return (
    <div className="group relative">
      <Link
        href={`/ideas/${idea.id}`}
        className={cn(
          "flex flex-col rounded-xl border border-border bg-card transition-all duration-150 active:scale-[0.99]",
          // Mobile: compact padding. Desktop: more spacious
          "p-4 md:p-5",
          "gap-2.5 md:gap-3",
          "hover:border-primary/40 hover:shadow-sm"
        )}
      >
        {/* Title row */}
        <div className="flex items-start gap-2 min-w-0">
          {isProject && <Rocket className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />}
          <p className={cn(
            "font-medium leading-snug flex-1 min-w-0",
            // Mobile: 1 line. Desktop: 2 lines
            "line-clamp-1 md:line-clamp-2",
            "text-sm md:text-sm",
            "group-hover:text-primary transition-colors"
          )}>
            {idea.title}
          </p>
        </div>

        {/* Description — hidden on mobile to save space */}
        {idea.description && (
          <p className="hidden md:block text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {idea.description}
          </p>
        )}

        {/* Tags — only first 2 on mobile */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map(({ tag }) => (
              <TagPill key={tag.id} name={tag.name} size="sm" />
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">+{idea.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Next step — always visible, high value info */}
        {idea.nextStep && (
          <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 line-clamp-1 italic">
            → {idea.nextStep}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 min-w-0">
            <StatusBadge status={idea.status} />
            {idea.category && (
              <span
                className="hidden sm:inline text-xs font-medium px-1.5 py-0.5 rounded-full truncate max-w-[80px]"
                style={{ color: idea.category.color, backgroundColor: `${idea.category.color}15` }}
              >
                {idea.category.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              <span className="text-xs font-medium tabular-nums">{score.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground/60 tabular-nums">{timeAgo(idea.createdAt)}</span>
          </div>
        </div>
      </Link>

      {/* Quick actions — on desktop: hover. On mobile: always visible small buttons */}
      {showQuickActions && (
        <div className={cn(
          "absolute top-3 right-3 flex items-center gap-1",
          // Desktop: only on hover
          "md:opacity-0 md:group-hover:opacity-100",
          // Mobile: always visible but very small
          "opacity-100 md:transition-opacity"
        )}>
          {acting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          ) : (
            <>
              {!isArchived && idea.status !== "ACTIVE" && (
                <button
                  onClick={(e) => quickAction(e, "activate", { status: "ACTIVE" })}
                  title="Activar"
                  className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors backdrop-blur-sm"
                >
                  <Zap className="w-3 h-3" />
                </button>
              )}
              {!isProject && (
                <button
                  onClick={(e) => quickAction(e, "project", { type: "PROJECT", status: "ACTIVE" })}
                  title="Convertir a Proyecto"
                  className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 dark:hover:bg-violet-950 transition-colors backdrop-blur-sm"
                >
                  <Rocket className="w-3 h-3" />
                </button>
              )}
              {isArchived ? (
                <button
                  onClick={(e) => quickAction(e, "restore", { status: "DRAFT" })}
                  title="Restaurar"
                  className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors backdrop-blur-sm"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={(e) => quickAction(e, "archive", { status: "ARCHIVED" })}
                  title="Archivar"
                  className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm"
                >
                  <Archive className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
