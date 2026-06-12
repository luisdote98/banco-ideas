"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      toast.success("Imagen subida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border group">
        <Image
          src={value}
          alt="Imagen adjunta"
          width={800}
          height={400}
          className="w-full max-h-64 object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all",
        "p-8 min-h-[120px]",
        dragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        uploading && "pointer-events-none opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {uploading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center md:hidden">
              <Camera className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Añadir imagen</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="md:hidden">Toca para abrir cámara o galería</span>
              <span className="hidden md:block">Arrastra una imagen o haz clic · Máx. 10MB</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
