export const DEFAULT_CATEGORIES = [
  { name: "Negocio", slug: "negocio", icon: "briefcase", color: "#6366f1" },
  { name: "Programación", slug: "programacion", icon: "code-2", color: "#8b5cf6" },
  { name: "Diseño", slug: "diseno", icon: "palette", color: "#ec4899" },
  { name: "Marketing", slug: "marketing", icon: "megaphone", color: "#f59e0b" },
  { name: "Viajes", slug: "viajes", icon: "plane", color: "#10b981" },
  { name: "Noticias", slug: "noticias", icon: "newspaper", color: "#3b82f6" },
  { name: "Objetivos", slug: "objetivos", icon: "target", color: "#ef4444" },
  { name: "Proyectos", slug: "proyectos", icon: "rocket", color: "#f97316" },
  { name: "Curiosidades", slug: "curiosidades", icon: "flask-conical", color: "#14b8a6" },
  { name: "Aprendizajes", slug: "aprendizajes", icon: "book-open", color: "#84cc16" },
];

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  INCUBATING: "Incubando",
  ARCHIVED: "Archivada",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  INCUBATING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ARCHIVED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
