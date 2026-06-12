"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Image as ImageIcon, Calendar } from "lucide-react";
import { formatDate, scoreCompuesto } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import Image from "next/image";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  nextStep: string | null;
  status: string;
  type: string;
  scorePotential: number;
  scoreEffort: number;
  scoreInterest: number;
  imageUrl: string | null;
  createdAt: Date;
  category: { name: string } | null;
  tags: { tag: { name: string } }[];
};

type Props = { ideas: Idea[] };

function buildExportText(ideas: Idea[]): string {
  if (ideas.length === 0) return "";

  const lines: string[] = [
    `IDEAS DE LA SEMANA — ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`,
    `Total: ${ideas.length} idea${ideas.length !== 1 ? "s" : ""}`,
    "",
    "Hola Claude, estas son mis ideas de esta semana. Por favor:",
    "1. Reescríbelas de forma más clara y profesional",
    "2. Mejora el título si es necesario",
    "3. Expande la descripción si hay poco contexto",
    "4. Sugiere un próximo paso concreto si no lo hay",
    "5. Si hay imagen adjunta, tenla en cuenta para el contexto",
    "",
    "═".repeat(50),
    "",
  ];

  ideas.forEach((idea, i) => {
    const score = scoreCompuesto(idea.scorePotential, idea.scoreEffort, idea.scoreInterest);

    lines.push(`IDEA ${i + 1} de ${ideas.length}`);
    lines.push(`Título: ${idea.title}`);
    lines.push(`Fecha: ${formatDate(idea.createdAt)}`);
    lines.push(`Estado: ${STATUS_LABELS[idea.status] ?? idea.status}`);
    lines.push(`Tipo: ${idea.type === "PROJECT" ? "Proyecto" : "Idea"}`);

    if (idea.category) {
      lines.push(`Categoría: ${idea.category.name}`);
    }

    if (idea.tags.length > 0) {
      lines.push(`Etiquetas: ${idea.tags.map((t) => `#${t.tag.name}`).join(", ")}`);
    }

    lines.push(`Puntuación: ${score.toFixed(1)}/10 (Potencial: ${idea.scorePotential} · Esfuerzo: ${idea.scoreEffort} · Interés: ${idea.scoreInterest})`);

    if (idea.description) {
      lines.push("");
      lines.push("Descripción:");
      lines.push(idea.description);
    }

    if (idea.nextStep) {
      lines.push("");
      lines.push(`Próximo paso: ${idea.nextStep}`);
    }

    if (idea.imageUrl) {
      lines.push("");
      lines.push(`Imagen adjunta: ${idea.imageUrl}`);
    }

    lines.push("");
    lines.push("─".repeat(40));
    lines.push("");
  });

  return lines.join("\n");
}

export function ExportClient({ ideas }: Props) {
  const [copied, setCopied] = useState(false);

  const exportText = buildExportText(ideas);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const hasImages = ideas.some((i) => i.imageUrl);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h2 className="text-2xl font-semibold tracking-tight">Exportar para IA</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Ideas de los últimos 7 días listas para copiar y pegar en Claude o ChatGPT
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground">Sin ideas esta semana</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Las ideas de los últimos 7 días aparecerán aquí
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{ideas.length} ideas</span>
            {hasImages && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                {ideas.filter((i) => i.imageUrl).length} con imagen
              </span>
            )}
          </div>

          {/* Preview de ideas */}
          <div className="space-y-3">
            {ideas.map((idea, i) => (
              <div
                key={idea.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="text-xs font-bold text-muted-foreground/50 mt-0.5 w-5 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm leading-snug">{idea.title}</p>
                  {idea.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {idea.category && (
                      <span className="text-xs text-muted-foreground">{idea.category.name}</span>
                    )}
                    {idea.tags.slice(0, 3).map(({ tag }) => (
                      <span key={tag.name} className="text-xs text-muted-foreground">#{tag.name}</span>
                    ))}
                  </div>
                </div>
                {idea.imageUrl && (
                  <div className="shrink-0">
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      width={56}
                      height={56}
                      className="w-14 h-14 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Instrucciones + botón copiar */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20 p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Cómo usarlo
              </p>
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Copia el texto con el botón de abajo</li>
                <li>
                  Abre{" "}
                  <a
                    href="https://claude.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 dark:text-violet-400 underline underline-offset-2"
                  >
                    claude.ai
                  </a>{" "}
                  y pega el texto en el chat
                </li>
                {hasImages && (
                  <li>
                    Para las ideas con imagen, abre la URL de la imagen y arrástrala al chat
                  </li>
                )}
                <li>Claude te devolverá las ideas mejoradas</li>
              </ol>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Copiado! Ahora pégalo en Claude
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar ideas formateadas
                </>
              )}
            </button>
          </div>

          {/* Vista previa del texto */}
          <details className="group">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
              <span className="group-open:hidden">▶ Ver texto que se copiará</span>
              <span className="hidden group-open:block">▼ Ocultar vista previa</span>
            </summary>
            <pre className="mt-3 p-4 rounded-xl bg-muted text-xs overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground">
              {exportText}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
