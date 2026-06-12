"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MapPin, Calendar, ChevronDown, ChevronUp,
  Loader2, Trash2, Archive, RotateCcw, Check, X, Rocket, ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TagInput } from "@/components/shared/TagInput";
import { TagPill } from "@/components/shared/TagPill";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryPicker } from "@/components/shared/CategoryPicker";
import { formatDate, cn } from "@/lib/utils";
import { IdeaHistoryTimeline } from "@/components/ideas/IdeaHistory";
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { Category, IdeaHistory } from "@/types";

type IdeaFull = {
  id: string;
  title: string;
  description: string | null;
  nextStep: string | null;
  status: string;
  type: string;
  scorePotential: number;
  scoreEffort: number;
  scoreInterest: number;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: Category | null;
  tags: { tag: { id: string; name: string; slug: string; color: string | null } }[];
  history?: IdeaHistory[];
  imageUrl?: string | null;
};

type Props = {
  idea: IdeaFull;
  categories: Category[];
};

type EditableField = "title" | "description" | "nextStep" | null;

export function IdeaDetailClient({ idea, categories }: Props) {
  const router = useRouter();

  const [data, setData] = useState({
    title: idea.title,
    description: idea.description ?? "",
    nextStep: idea.nextStep ?? "",
    status: idea.status,
    type: idea.type,
    categoryId: idea.categoryId ?? null,
    tags: idea.tags.map((t) => t.tag.name),
    imageUrl: idea.imageUrl ?? null,
  });

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [draft, setDraft] = useState("");
  const [lightbox, setLightbox] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(
    !!(idea.description || idea.nextStep || idea.categoryId || idea.tags.length > 0)
  );
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const patch = async (updates: Partial<typeof data> & Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      setData((prev) => ({ ...prev, ...updates }));
      router.refresh();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (field: EditableField, value: string) => {
    setEditingField(field);
    setDraft(value);
  };

  const commitEdit = async (field: EditableField) => {
    if (!field) return;
    if (field === "title" && !draft.trim()) {
      toast.error("El título no puede estar vacío");
      return;
    }
    await patch({ [field]: draft.trim() || null });
    setEditingField(null);
  };

  const cancelEdit = () => setEditingField(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
      toast.success("Idea eliminada");
      router.push("/inbox");
      router.refresh();
    } catch {
      toast.error("Error al eliminar");
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const isArchived = data.status === "ARCHIVED";

  return (
    <div className="space-y-6">

      {/* ── Título ──────────────────────────────────────────── */}
      <div>
        {editingField === "title" ? (
          <div className="space-y-2">
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit("title");
                if (e.key === "Escape") cancelEdit();
              }}
              className="text-2xl font-semibold h-auto py-1 px-2 border-0 border-b rounded-none focus-visible:ring-0 bg-transparent"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => commitEdit("title")} className="gap-1.5 h-7">
                <Check className="w-3 h-3" /> Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <h1
            className="text-2xl font-semibold tracking-tight leading-snug cursor-text hover:text-primary transition-colors"
            onClick={() => startEdit("title", data.title)}
          >
            {data.title}
          </h1>
        )}
      </div>

      {/* ── Estado ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Select
          value={data.status}
          onValueChange={(v) => { if (v) patch({ status: v }); }}
        >
          <SelectTrigger className="w-auto h-7 text-xs px-2 border-0 bg-transparent p-0 focus:ring-0 [&>svg]:ml-1">
            <StatusBadge status={data.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Borrador</SelectItem>
            <SelectItem value="ACTIVE">Activa</SelectItem>
            <SelectItem value="INCUBATING">Incubando</SelectItem>
            <SelectItem value="ARCHIVED">Archivada</SelectItem>
          </SelectContent>
        </Select>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>

      {/* ── Imagen visible ──────────────────────────────────── */}
      {data.imageUrl && (
        <>
          {lightbox && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setLightbox(false)}
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={() => setLightbox(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <Image
                src={data.imageUrl}
                alt={data.title}
                width={1200}
                height={900}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div
            className="relative rounded-xl overflow-hidden border border-border cursor-zoom-in group"
            onClick={() => setLightbox(true)}
          >
            <Image
              src={data.imageUrl}
              alt={data.title}
              width={800}
              height={500}
              className="w-full max-h-72 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Descripción ─────────────────────────────────────── */}
      <div>
        {editingField === "description" ? (
          <div className="space-y-2">
            <Textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
              placeholder="Describe la idea..."
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => commitEdit("description")} className="gap-1.5 h-7">
                <Check className="w-3 h-3" /> Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => startEdit("description", data.description)}
            className={cn(
              "rounded-xl px-4 py-3 cursor-text transition-colors min-h-[60px]",
              data.description
                ? "bg-muted/30 border border-border hover:border-primary/40"
                : "border border-dashed border-border hover:border-primary/40 flex items-center"
            )}
          >
            {data.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {data.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/50">Añade una descripción...</p>
            )}
          </div>
        )}
      </div>

      {/* ── Toggle detalles ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        <div className="flex-1 h-px bg-border" />
        {showAdvanced ? (
          <><ChevronUp className="w-3.5 h-3.5" /> Menos detalles</>
        ) : (
          <><ChevronDown className="w-3.5 h-3.5" /> Añadir detalles</>
        )}
        <div className="flex-1 h-px bg-border" />
      </button>

      {/* ── Sección avanzada ────────────────────────────────── */}
      {showAdvanced && (
        <div className="space-y-6">

          {/* Categoría — botones */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoría</p>
            <CategoryPicker
              categories={categories}
              value={data.categoryId}
              onChange={(id) => patch({ categoryId: id || null })}
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Imagen</p>
            <ImageUpload
              value={data.imageUrl}
              onChange={(url) => {
                setData((d) => ({ ...d, imageUrl: url }));
                patch({ imageUrl: url });
              }}
            />
          </div>

          {/* Etiquetas */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Etiquetas</p>
            <TagInput tags={data.tags} onChange={(tags) => patch({ tags })} />
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.tags.map((t, i) => <TagPill key={i} name={t} size="sm" />)}
              </div>
            )}
          </div>

          {/* Próximo paso */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próximo paso</p>
            {editingField === "nextStep" ? (
              <div className="space-y-2">
                <Input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit("nextStep");
                    if (e.key === "Escape") cancelEdit();
                  }}
                  placeholder="¿Cuál es la siguiente acción?"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => commitEdit("nextStep")} className="gap-1.5 h-7">
                    <Check className="w-3 h-3" /> Guardar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => startEdit("nextStep", data.nextStep)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-text transition-colors",
                  data.nextStep
                    ? "border-primary/20 bg-primary/5 hover:border-primary/40"
                    : "border-dashed border-border hover:border-primary/40"
                )}
              >
                <MapPin className={cn("w-4 h-4 shrink-0", data.nextStep ? "text-primary" : "text-muted-foreground/40")} />
                {data.nextStep
                  ? <p className="text-sm">{data.nextStep}</p>
                  : <p className="text-sm text-muted-foreground/50">Define el siguiente paso...</p>
                }
              </div>
            )}
          </div>

          {/* Convertir a proyecto */}
          <button
            onClick={() => patch({ type: data.type === "PROJECT" ? "IDEA" : "PROJECT" })}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors",
              data.type === "PROJECT"
                ? "border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400"
                : "border-border text-muted-foreground hover:border-violet-300 hover:text-violet-600"
            )}
          >
            <Rocket className="w-3.5 h-3.5" />
            {data.type === "PROJECT" ? "Es un Proyecto" : "Convertir a Proyecto"}
          </button>

        </div>
      )}

      {/* ── Metadata + Acciones ─────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(idea.createdAt)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            className="gap-1.5 text-muted-foreground h-7 text-xs"
            onClick={() => patch({ status: isArchived ? "DRAFT" : "ARCHIVED" })}
          >
            {isArchived
              ? <><RotateCcw className="w-3.5 h-3.5" /> Restaurar</>
              : <><Archive className="w-3.5 h-3.5" /> Archivar</>
            }
          </Button>
          <Button
            variant="ghost" size="sm"
            className="gap-1.5 text-destructive hover:text-destructive h-7 text-xs"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </Button>
        </div>
      </div>

      {/* Historial */}
      {idea.history && idea.history.length > 0 && (
        <div className="pt-2">
          <IdeaHistoryTimeline history={idea.history} />
        </div>
      )}

      {/* Diálogo eliminar */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar idea?</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
