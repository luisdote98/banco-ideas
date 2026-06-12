"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Rocket, Archive, Zap, RotateCcw, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn, timeAgo } from "@/lib/utils";
import { TagPill } from "@/components/shared/TagPill";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { IdeaWithRelations } from "@/types";

type Props = {
  idea: IdeaWithRelations;
  showQuickActions?: boolean;
};

export function IdeaCard({ idea, showQuickActions = false }: Props) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Desaparece inmediatamente del DOM si se ha eliminado
  if (deleted) return null;

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
        action === "activate"  ? "Marcada como Activa" :
        action === "archive"   ? "Archivada" :
        action === "restore"   ? "Restaurada" :
        action === "project"   ? "Convertida a Proyecto" : "Actualizada"
      );
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleteOpen(false);
      setDeleted(true); // desaparece al instante
      toast.success("Idea eliminada");
      router.refresh();
    } catch {
      toast.error("Error al eliminar");
      setDeleting(false);
    }
  };

  const isArchived = idea.status === "ARCHIVED";
  const isProject  = idea.type === "PROJECT";

  return (
    <>
      <div className="group relative">
        <Link
          href={`/ideas/${idea.id}`}
          className={cn(
            "flex flex-col rounded-xl border border-border bg-card transition-all duration-150 active:scale-[0.99]",
            "hover:border-primary/40 hover:shadow-sm",
            "overflow-hidden"
          )}
        >
          {/* Image thumbnail */}
          {idea.imageUrl && (
            <div className="relative w-full h-36 bg-muted">
              <Image
                src={idea.imageUrl}
                alt={idea.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}

          <div className="flex flex-col gap-2.5 md:gap-3 p-4 md:p-5">

            {/* Title */}
            <div className="flex items-start gap-2 min-w-0">
              {isProject && <Rocket className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />}
              <p className={cn(
                "font-medium leading-snug flex-1 min-w-0 text-sm",
                "line-clamp-1 md:line-clamp-2",
                "group-hover:text-primary transition-colors",
                // Deja espacio para el botón eliminar en móvil
                showQuickActions && "pr-6 md:pr-0"
              )}>
                {idea.title}
              </p>
            </div>

            {/* Description — solo desktop */}
            {idea.description && (
              <p className="hidden md:block text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {idea.description}
              </p>
            )}

            {/* Tags */}
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

            {/* Next step */}
            {idea.nextStep && (
              <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 line-clamp-1 italic">
                → {idea.nextStep}
              </p>
            )}

            {/* Bottom row — estado siempre visible y prominente */}
            <div className="flex items-center justify-between mt-auto gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                {/* Estado — siempre visible */}
                <StatusBadge status={idea.status} />
                {idea.category && (
                  <span
                    className="hidden sm:inline text-xs font-medium px-1.5 py-0.5 rounded-full truncate max-w-[90px]"
                    style={{ color: idea.category.color, backgroundColor: `${idea.category.color}15` }}
                  >
                    {idea.category.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground/60 tabular-nums">{timeAgo(idea.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Acciones rápidas */}
        {showQuickActions && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {acting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            ) : (
              <>
                {/* Activar */}
                {!isArchived && idea.status !== "ACTIVE" && (
                  <button
                    onClick={(e) => quickAction(e, "activate", { status: "ACTIVE" })}
                    title="Activar"
                    className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 md:transition-opacity"
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                )}

                {/* Convertir a proyecto */}
                {!isProject && (
                  <button
                    onClick={(e) => quickAction(e, "project", { type: "PROJECT", status: "ACTIVE" })}
                    title="Convertir a Proyecto"
                    className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 dark:hover:bg-violet-950 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 md:transition-opacity"
                  >
                    <Rocket className="w-3 h-3" />
                  </button>
                )}

                {/* Archivar / Restaurar */}
                {isArchived ? (
                  <button
                    onClick={(e) => quickAction(e, "restore", { status: "DRAFT" })}
                    title="Restaurar"
                    className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 md:transition-opacity"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => quickAction(e, "archive", { status: "ARCHIVED" })}
                    title="Archivar"
                    className="p-1.5 rounded-md bg-background/90 border border-border hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 md:transition-opacity"
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                )}

                {/* Eliminar — SIEMPRE visible, rojo */}
                <button
                  onClick={handleDelete}
                  title="Eliminar idea"
                  className="p-1.5 rounded-md bg-background/90 border border-border text-destructive hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta idea?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">"{idea.title}"</span>
              <br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
