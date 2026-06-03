"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export function QuickCapture() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Small delay so keyboard doesn't obscure the field on mobile
    const t = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save();
    }
  };

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) { textareaRef.current?.focus(); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          status: "DRAFT",
          scorePotential: 5,
          scoreEffort: 5,
          scoreInterest: 5,
          tags: [],
        }),
      });
      if (!res.ok) throw new Error();
      const idea = await res.json();
      toast.success("Idea guardada en Inbox");
      router.push(`/ideas/${idea.id}`);
      router.refresh();
    } catch {
      toast.error("Error al guardar");
      setLoading(false);
    }
  };

  const isValid = title.trim().length > 0;
  const charCount = title.length;

  return (
    // Mobile: full height, no centering — textarea at top so keyboard doesn't hide it
    // Desktop: centered layout
    <div className="flex flex-col md:items-center md:justify-center min-h-full px-4 pt-6 pb-4 md:px-6 md:py-16">
      <div className="w-full max-w-xl space-y-4 md:space-y-6">

        {/* Header — compact on mobile */}
        <div className="space-y-0.5 md:text-center md:space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">¿Qué idea tienes?</h1>
          <p className="text-sm text-muted-foreground">
            Escríbela. Los detalles después.
          </p>
        </div>

        {/* Input card */}
        <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/60 focus-within:shadow-md transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={title}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe tu idea en una frase..."
            // Mobile: min 3 rows. Desktop: 3 rows
            rows={3}
            maxLength={200}
            className="w-full resize-none rounded-2xl bg-transparent px-4 pt-4 pb-12 text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none"
            style={{ minHeight: "120px" }}
          />

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3.5">
            <span className={`text-xs tabular-nums transition-colors ${charCount > 180 ? "text-amber-500" : "text-muted-foreground/40"}`}>
              {charCount > 0 ? `${charCount}/200` : ""}
            </span>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground/40">⌘↵</span>
              <button
                onClick={save}
                disabled={!isValid || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 active:scale-95 transition-all"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ArrowRight className="w-4 h-4" />
                }
                Guardar
              </button>
            </div>
          </div>
        </div>

        {/* Hint — compact on mobile */}
        <p className="text-xs text-muted-foreground/50 md:text-center">
          Se guarda como borrador · Añade categoría y etiquetas después
        </p>
      </div>
    </div>
  );
}
