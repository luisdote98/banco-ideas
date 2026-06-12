"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, Clipboard, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al subir");
  return data.url;
}

export function QuickCapture() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  // Pegar imagen con Ctrl+V
  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((i) => i.type.startsWith("image/"));
    if (!imageItem) return; // texto normal → comportamiento por defecto

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
      toast.success("Imagen pegada ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  // Soltar imagen con drag & drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed && !imageUrl) {
      textareaRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed || "Sin título",
          status: "DRAFT",
          scorePotential: 5,
          scoreEffort: 5,
          scoreInterest: 5,
          tags: [],
          imageUrl: imageUrl ?? undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const idea = await res.json();
      toast.success("Idea guardada en Inbox");
      router.push(`/ideas/${idea.id}`);
      router.refresh();
    } catch {
      toast.error("Error al guardar");
      setSaving(false);
    }
  };

  const isValid = (title.trim().length > 0 || imageUrl !== null) && !uploading;
  const charCount = title.length;

  return (
    <div className="flex flex-col md:items-center md:justify-center min-h-full px-4 pt-6 pb-4 md:px-6 md:py-16">
      <div className="w-full max-w-xl space-y-3 md:space-y-4">

        {/* Header */}
        <div className="space-y-0.5 md:text-center md:space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">¿Qué idea tienes?</h1>
          <p className="text-sm text-muted-foreground">
            Escribe o pega una imagen con <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs">Ctrl+V</kbd>
          </p>
        </div>

        {/* Card principal — textarea + zona de imagen unificadas */}
        <div
          className={cn(
            "rounded-2xl border bg-card shadow-sm transition-all duration-200",
            dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border",
            "focus-within:border-primary/60 focus-within:shadow-md"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {/* Imagen pegada / subida */}
          {imageUrl && (
            <div className="relative">
              <Image
                src={imageUrl}
                alt="Imagen adjunta"
                width={800}
                height={400}
                className="w-full max-h-56 object-cover rounded-t-2xl"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Estado: subiendo imagen */}
          {uploading && !imageUrl && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Subiendo imagen...</span>
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={title}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                dragOver
                  ? "Suelta la imagen aquí..."
                  : imageUrl
                    ? "Añade una descripción (opcional)..."
                    : "Escribe tu idea o pega una captura de pantalla..."
              }
              rows={3}
              maxLength={200}
              className="w-full resize-none bg-transparent px-4 pt-4 pb-12 text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none"
              style={{ minHeight: imageUrl ? "80px" : "120px" }}
            />

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3.5">
              <div className="flex items-center gap-2">
                {/* Botón para subir desde archivo (móvil) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
                  title="Adjuntar imagen"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <span className={`text-xs tabular-nums transition-colors ${charCount > 180 ? "text-amber-500" : "text-muted-foreground/40"}`}>
                  {charCount > 0 ? `${charCount}/200` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs text-muted-foreground/40">⌘↵</span>
                <button
                  onClick={save}
                  disabled={!isValid || saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 active:scale-95 transition-all"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ArrowRight className="w-4 h-4" />
                  }
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Input oculto para móvil (cámara/galería) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const url = await uploadFile(file);
              setImageUrl(url);
            } catch {
              toast.error("Error al subir imagen");
            } finally {
              setUploading(false);
              e.target.value = "";
            }
          }}
        />

        <p className="text-xs text-muted-foreground/50 md:text-center">
          Se guarda como borrador en tu Inbox
        </p>
      </div>
    </div>
  );
}
