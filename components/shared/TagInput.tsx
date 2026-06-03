"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { TagPill } from "@/components/shared/TagPill";
import { slugify } from "@/lib/utils";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    const clean = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
    if (!clean) return;
    const slug = slugify(clean);
    if (!slug) return;
    if (tags.map(slugify).includes(slug)) {
      setInput("");
      return;
    }
    onChange([...tags, clean]);
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-0">
        {tags.map((tag, i) => (
          <TagPill key={i} name={tag} onRemove={() => removeTag(i)} />
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Escribe una etiqueta y pulsa Enter..."
        className="text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Pulsa <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd>, coma o espacio para añadir
      </p>
    </div>
  );
}
