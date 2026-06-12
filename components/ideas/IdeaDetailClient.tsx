"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Star, MapPin, Calendar, ChevronDown, ChevronUp,
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
import { ScoreSlider } from "@/components/shared/ScoreSlider";
import { ScoreBar } from "@/components/shared/ScoreBar";
import { TagInput } from "@/components/shared/TagInput";
import { TagPill } from "@/components/shared/TagPill";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { scoreCompuesto, formatDate, cn } from "@/lib/utils";
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

  // Local state mirrors the idea so UI updates optimistically
  const [data, setData] = useState({
    title: idea.title,
    description: idea.description ?? "",
    nextStep: idea.nextStep ?? "",
    status: idea.status,
    type: idea.type,
    categoryId: idea.categoryId ?? "",
    scorePotential: idea.scorePotential,
    scoreEffort: idea.scoreEffort,
    scoreInterest: idea.scoreInterest,
    tags: idea.tags.map((t) => t.tag.name),
    imageUrl: idea.imageUrl ?? null,
  });

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [lightbox, setLightbox] = useState(false);
  const [draft, setDraft] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(
    // Auto-expand if any advanced field is filled
    !!(idea.description || idea.nextStep || idea.categoryId ||
      idea.tags.length > 0 || idea.scorePotential !== 5 ||
      idea.scoreEffort !== 5 || idea.scoreInterest !== 5)
  );
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const patch = async (updates: Partial<typeof data>) => {
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

  // Inline text editing
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

  const score = scoreCompuesto(data.scorePotential, data.scoreEffort, data.scoreInterest);
  const isArchived = data.status === "ARCHIVED";

  return (
    <div className="space-y-6">

      {/* ── Title ─────────────────────────────────────────── */}
      <div className="group">
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
            title="Haz clic para editar"
          >
            {data.title}
          </h1>
        )}
      </div>

      {/* ── Status + Category + Score row ─────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex items-center gap-1.5 text-amber-500 ml-auto">
          <Star className="w-4 h-4 fill-amber-500" />
          <span className="text-sm font-semibold tabular-nums">{score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/ 10</span>
          {saving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-1" />}
        </div>
      </div>

      {/* ── Description ───────────────────────────────────── */}
      <div>
        {editingField === "description" ? (
          <div className="space-y-2">
            <Textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEdit();
              }}
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

      {/* ── Imagen visible ────────────────────────────────── */}
      {data.imageUrl && (
        <>
          {/* Lightbox */}
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

          {/* Miniatura clicable */}
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

      {/* ── Advanced toggle ────────────────────────────────── */}
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

      {/* ── Advanced section ───────────────────────────────── */}
      {showAdvanced && (
        <div className="space-y-6">

          {/* Category */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoría</p>
            <Select
              value={data.categoryId || "_none"}
              onValueChange={(v) => patch({ categoryId: !v || v === "_none" ? "" : v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Sin categoría</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Imagen</p>
            <ImageUpload
              value={data.imageUrl}
              onChange={(url) => {
                setData((d) => ({ ...d, imageUrl: url }));
                patch({ imageUrl: url });
              }}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Etiquetas</p>
            {editingField === null && (
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 cursor-text min-h-[38px] transition-colors",
                  data.tags.length ? "border-border hover:border-primary/40" : "border-dashed border-border hover:border-primary/40"
                )}
                onClick={() => setEditingField("title")} // Trick: use a flag
              >
                {data.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {data.tags.map((t, i) => <TagPill key={i} name={t} size="sm" />)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">Añade etiquetas...</p>
                )}
              </div>
            )}
            <TagInput
              tags={data.tags}
              onChange={(tags) => patch({ tags })}
            />
          </div>

          {/* Scores */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Puntuación</p>
            <ScoreSlider
              label="Potencial económico"
              description="¿Qué valor podría generar?"
              value={data.scorePotential}
              onChange={(v) => setData((d) => ({ ...d, scorePotential: v }))}
              accentColor="#8b5cf6"
            />
            <ScoreSlider
              label="Esfuerzo requerido"
              description="1 = mínimo · 10 = máximo"
              value={data.scoreEffort}
              onChange={(v) => setData((d) => ({ ...d, scoreEffort: v }))}
              accentColor="#f59e0b"
            />
            <ScoreSlider
              label="Interés personal"
              description="¿Cuánto te motiva?"
              value={data.scoreInterest}
              onChange={(v) => setData((d) => ({ ...d, scoreInterest: v }))}
              accentColor="#10b981"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-1"
              onClick={() => patch({
                scorePotential: data.scorePotential,
                scoreEffort: data.scoreEffort,
                scoreInterest: data.scoreInterest,
              })}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
              Guardar puntuación
            </Button>

            <div className="pt-3 border-t border-border space-y-3">
              <ScoreBar label="Potencial" value={data.scorePotential} hexColor="#8b5cf6" />
              <ScoreBar label="Esfuerzo" value={data.scoreEffort} hexColor="#f59e0b" />
              <ScoreBar label="Interés" value={data.scoreInterest} hexColor="#10b981" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Score compuesto</span>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="font-semibold text-sm">{score.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next step */}
          <div className="space-y-1.5">
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
                {data.nextStep ? (
                  <p className="text-sm">{data.nextStep}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/50">Define el siguiente paso...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Metadata + Actions ────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(idea.createdAt)}
          </div>
          {/* Convert to project toggle */}
          <button
            onClick={() => patch({ type: data.type === "PROJECT" ? "IDEA" : "PROJECT" })}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors",
              data.type === "PROJECT"
                ? "border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400"
                : "border-border hover:border-violet-300 hover:text-violet-600"
            )}
          >
            <Rocket className="w-3 h-3" />
            {data.type === "PROJECT" ? "Proyecto" : "Convertir a proyecto"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground h-7 text-xs"
            onClick={() => patch({ status: isArchived ? "DRAFT" : "ARCHIVED" })}
          >
            {isArchived ? (
              <><RotateCcw className="w-3.5 h-3.5" /> Restaurar</>
            ) : (
              <><Archive className="w-3.5 h-3.5" /> Archivar</>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive h-7 text-xs"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </Button>
        </div>
      </div>

      {/* ── History ───────────────────────────────────────── */}
      {idea.history && idea.history.length > 0 && (
        <div className="pt-2">
          <IdeaHistoryTimeline history={idea.history} />
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar idea?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
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
