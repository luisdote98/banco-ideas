"use client";

import {
  Briefcase, Code2, Palette, Megaphone, Plane,
  Newspaper, Target, Rocket, FlaskConical, BookOpen,
  Lightbulb, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  "code-2": Code2,
  palette: Palette,
  megaphone: Megaphone,
  plane: Plane,
  newspaper: Newspaper,
  target: Target,
  rocket: Rocket,
  "flask-conical": FlaskConical,
  "book-open": BookOpen,
  lightbulb: Lightbulb,
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Props = {
  categories: Category[];
  value: string | null | undefined;  // categoryId seleccionado o ""
  onChange: (id: string) => void;
};

export function CategoryPicker({ categories, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Botón "Sin categoría" */}
      <button
        type="button"
        onClick={() => onChange("")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
          !value || value === ""
            ? "border-border bg-muted text-foreground"
            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
        )}
      >
        <X className="w-3.5 h-3.5" />
        Ninguna
      </button>

      {categories.map((cat) => {
        const Icon = iconMap[cat.icon] ?? Lightbulb;
        const selected = !!value && value === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(selected ? "" : cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
              selected
                ? "border-2 text-foreground shadow-sm"
                : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
            )}
            style={selected ? {
              borderColor: cat.color,
              backgroundColor: `${cat.color}15`,
              color: cat.color,
            } : {}}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={selected ? { color: cat.color } : {}} />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
