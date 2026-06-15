"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy, Check, Sparkles, Image as ImageIcon, Calendar,
  ClipboardPaste, ArrowRight, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { formatDate, scoreCompuesto } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { parseClaudeOutput, type ParsedIdea } from "@/lib/parseClaudeIdeas";
import { toast } from "sonner";
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
    if (idea.category) lines.push(`Categoría: ${idea.category.name}`);
    if (idea.tags.length > 0) lines.push(`Etiquetas: ${idea.tags.map((t) => `#${t.tag.name}`).join(", ")}`);
    lines.push(`Puntuación: ${score.toFixed(1)}/10`);
    if (idea.description) { lines.push(""); lines.push("Descripción:"); lines.push(idea.description); }
    if (idea.nextStep) { lines.push(""); lines.push(`Próximo paso: ${idea.nextStep}`); }
    if (idea.imageUrl) { lines.push(""); lines.push(`Imagen adjunta: ${idea.imageUrl}`); }
    lines.push("");
    lines.push("─".repeat(40));
    lines.push("");
  });

  return lines.join("\n");
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function ExportImportClient({ ideas }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"export" | "import">("export");

  // Export state
  const [copied, setCopied] = useState(false);
  const exportText = buildExportText(ideas);
  const hasImages = ideas.some((i) => i.imageUrl);

  const markAsExported = async (showToast = false) => {
    if (ideas.length === 0) return;
    try {
      await fetch("/api/ideas/mark-exported", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ideas.map((i) => i.id) }),
      });
      if (showToast) {
        toast.success(`${ideas.length} ideas marcadas — ya no saldrán en el exportador`);
        router.refresh();
      }
    } catch {
      if (showToast) toast.error("Error al marcar las ideas");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    await markAsExported(false); // marca silenciosamente al copiar
  };

  // Import state
  const [pastedText, setPastedText] = useState("");
  const [parsed, setParsed] = useState<ParsedIdea[]>([]);
  const [saveStatuses, setSaveStatuses] = useState<SaveStatus[]>([]);
  const [allSaved, setAllSaved] = useState(false);

  const handleParse = () => {
    if (!pastedText.trim()) { toast.error("Pega primero el texto de Claude"); return; }
    const result = parseClaudeOutput(pastedText);
    if (result.length === 0) { toast.error("No se encontraron ideas en el texto. ¿Está en el formato correcto?"); return; }
    setParsed(result);
    setSaveStatuses(result.map(() => "idle"));
    setAllSaved(false);
    toast.success(`${result.length} idea${result.length !== 1 ? "s" : ""} detectada${result.length !== 1 ? "s" : ""}`);
  };

  const saveOne = async (idea: ParsedIdea, index: number): Promise<boolean> => {
    setSaveStatuses((prev) => {
      const next = [...prev];
      next[index] = "saving";
      return next;
    });
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title || "Sin título",
          description: idea.description || null,
          nextStep: idea.nextStep || null,
          status: idea.status || "DRAFT",
          scorePotential: 5,
          scoreEffort: 5,
          scoreInterest: 5,
          tags: [],
          aiImproved: true,
          aiProcessedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      setSaveStatuses((prev) => {
        const next = [...prev];
        next[index] = "saved";
        return next;
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Idea ${index + 1}: ${msg}`);
      setSaveStatuses((prev) => {
        const next = [...prev];
        next[index] = "error";
        return next;
      });
      return false;
    }
  };

  const saveAll = async () => {
    // Guardar secuencialmente para evitar conflictos de estado
    let savedAny = false;
    for (let i = 0; i < parsed.length; i++) {
      if (saveStatuses[i] !== "saved") {
        const ok = await saveOne(parsed[i], i);
        if (ok) savedAny = true;
      }
    }
    if (savedAny) {
      setAllSaved(true);
      toast.success("Ideas guardadas. No volverán a aparecer en el exportador ✓");
      router.refresh();
    }
  };

  const savedCount = saveStatuses.filter(s => s === "saved").length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h2 className="text-2xl font-semibold tracking-tight">IA de Ideas</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Exporta tus ideas a Claude e importa las mejoras de vuelta
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border p-1 bg-muted/40 gap-1">
        {(["export", "import"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "export" ? "1. Exportar a Claude" : "2. Importar mejoras"}
          </button>
        ))}
      </div>

      {/* ── EXPORTAR ── */}
      {tab === "export" && (
        <div className="space-y-5">
          {ideas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">Sin ideas esta semana</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{ideas.length} ideas</span>
                {hasImages && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {ideas.filter((i) => i.imageUrl).length} con imagen
                  </span>
                )}
              </div>

              {/* Lista de ideas */}
              <div className="space-y-3">
                {ideas.map((idea, i) => (
                  <div key={idea.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <span className="text-xs font-bold text-muted-foreground/50 mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-sm">{idea.title}</p>
                      {idea.description && <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>}
                    </div>
                    {idea.imageUrl && (
                      <Image src={idea.imageUrl} alt={idea.title} width={56} height={56} className="w-14 h-14 object-cover rounded-lg border border-border shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Copiar + instrucciones */}
              <div className="rounded-2xl border border-violet-200 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20 p-5 space-y-4">
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Copia el texto con el botón de abajo</li>
                  <li>
                    Abre{" "}
                    <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 underline underline-offset-2">
                      claude.ai
                    </a>{" "}
                    y pega el texto
                  </li>
                  <li>Claude te devolverá las ideas mejoradas</li>
                  <li>Vuelve aquí, ve a la pestaña "Importar mejoras" y pega la respuesta</li>
                </ol>

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
                >
                  {copied ? <><Check className="w-4 h-4" />¡Copiado!</> : <><Copy className="w-4 h-4" />Copiar ideas formateadas</>}
                </button>
              </div>

              {/* Marcar manualmente ideas ya enviadas previamente */}
              <button
                onClick={() => markAsExported(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ya envié estas ideas antes — marcarlas como exportadas
              </button>
            </>
          )}
        </div>
      )}

      {/* ── IMPORTAR ── */}
      {tab === "import" && (
        <div className="space-y-5">
          {/* Textarea para pegar */}
          {parsed.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pega aquí la respuesta completa de Claude:
              </p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Pega aquí el texto que te ha dado Claude con las ideas mejoradas..."
                rows={12}
                className="w-full rounded-xl border border-border bg-card p-4 text-sm resize-none focus:outline-none focus:border-primary/60 font-mono"
              />
              <button
                onClick={handleParse}
                disabled={!pastedText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-colors"
              >
                <ClipboardPaste className="w-4 h-4" />
                Detectar ideas
              </button>
            </div>
          )}

          {/* Ideas parseadas */}
          {parsed.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{parsed.length} ideas detectadas</p>
                <button
                  onClick={() => { setParsed([]); setPastedText(""); setAllSaved(false); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Volver a pegar
                </button>
              </div>

              {parsed.map((idea, i) => {
                const st = saveStatuses[i];
                return (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Header de la idea */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground/50">#{i + 1}</span>
                        <p className="font-semibold text-sm">{idea.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {st === "saved" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {st === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                        {st !== "saved" && (
                          <button
                            onClick={() => saveOne(idea, i)}
                            disabled={st === "saving"}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
                          >
                            {st === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                            Guardar
                          </button>
                        )}
                        {st === "saved" && <span className="text-xs text-emerald-600 font-medium">Guardada</span>}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="px-4 py-3 space-y-2">
                      {idea.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {idea.description}
                        </p>
                      )}
                      {idea.nextStep && (
                        <div className="flex items-start gap-2 text-sm text-primary border-l-2 border-primary/30 pl-3">
                          <span className="shrink-0 font-medium text-xs text-muted-foreground">→</span>
                          <span className="text-xs">{idea.nextStep}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Guardar todas */}
              {!allSaved && (
                <button
                  onClick={saveAll}
                  disabled={saveStatuses.every(s => s === "saved")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar todas en el Inbox ({savedCount}/{parsed.length} guardadas)
                </button>
              )}

              {allSaved && (
                <div className="flex items-center justify-center gap-2 py-4 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Todas las ideas guardadas en el Inbox
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
