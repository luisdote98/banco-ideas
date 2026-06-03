"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScoreSlider } from "@/components/shared/ScoreSlider";
import { TagInput } from "@/components/shared/TagInput";
import type { Category, IdeaWithRelations } from "@/types";

type Props = {
  categories: Category[];
  idea?: IdeaWithRelations;
};

export function IdeaForm({ categories, idea }: Props) {
  const router = useRouter();
  const isEditing = !!idea;

  const [title, setTitle] = useState(idea?.title ?? "");
  const [description, setDescription] = useState(idea?.description ?? "");
  const [nextStep, setNextStep] = useState(idea?.nextStep ?? "");
  const [categoryId, setCategoryId] = useState(idea?.categoryId ?? "");
  const [status, setStatus] = useState(idea?.status ?? "DRAFT");
  const [scorePotential, setScorePotential] = useState(idea?.scorePotential ?? 5);
  const [scoreEffort, setScoreEffort] = useState(idea?.scoreEffort ?? 5);
  const [scoreInterest, setScoreInterest] = useState(idea?.scoreInterest ?? 5);
  const [tags, setTags] = useState<string[]>(
    idea?.tags.map((t) => t.tag.name) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "El título es obligatorio";
    if (title.trim().length > 200) e.title = "Máximo 200 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const url = isEditing ? `/api/ideas/${idea.id}` : "/api/ideas";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          nextStep: nextStep.trim() || null,
          categoryId: categoryId || null,
          status,
          scorePotential,
          scoreEffort,
          scoreInterest,
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar la idea");
        return;
      }

      const saved = await res.json();
      toast.success(isEditing ? "Idea actualizada" : "Idea creada");
      router.push(`/ideas/${saved.id}`);
      router.refresh();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          placeholder="¿Cuál es tu idea?"
          className={errors.title ? "border-destructive" : ""}
          autoFocus
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explica la idea con más detalle..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Categoría + Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Sin categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin categoría</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="ACTIVE">Activa</SelectItem>
              <SelectItem value="INCUBATING">Incubando</SelectItem>
              <SelectItem value="ARCHIVED">Archivada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Etiquetas */}
      <div className="space-y-1.5">
        <Label>Etiquetas</Label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Puntuación */}
      <div className="space-y-5 rounded-xl border border-border bg-muted/30 p-5">
        <p className="text-sm font-medium">Puntuación</p>
        <ScoreSlider
          label="Potencial económico"
          description="¿Qué valor podría generar esta idea?"
          value={scorePotential}
          onChange={setScorePotential}
          accentColor="hsl(258, 90%, 66%)"
        />
        <ScoreSlider
          label="Esfuerzo requerido"
          description="1 = muy poco esfuerzo · 10 = mucho esfuerzo"
          value={scoreEffort}
          onChange={setScoreEffort}
          accentColor="hsl(38, 92%, 50%)"
        />
        <ScoreSlider
          label="Interés personal"
          description="¿Cuánto te motiva esta idea?"
          value={scoreInterest}
          onChange={setScoreInterest}
          accentColor="hsl(142, 71%, 45%)"
        />
      </div>

      {/* Próximo paso */}
      <div className="space-y-1.5">
        <Label htmlFor="nextStep">Próximo paso</Label>
        <Input
          id="nextStep"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          placeholder="¿Cuál es la siguiente acción concreta?"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? "Guardar cambios" : "Guardar idea"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
