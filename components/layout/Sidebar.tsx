"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Lightbulb, FolderOpen, Inbox,
  Briefcase, Code2, Palette, Megaphone, Plane,
  Newspaper, Target, Rocket, FlaskConical, BookOpen, ArrowRight, Sparkles, CheckCheck,
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
  slug: string;
  icon: string;
  color: string;
  _count: { ideas: number };
};

type Props = {
  categories: Category[];
  inboxCount: number;
};

export function Sidebar({ categories, inboxCount }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/inbox") return pathname === "/inbox";
    if (href === "/ideas") return pathname === "/ideas" || (pathname.startsWith("/ideas") && !pathname.startsWith("/ideas/nueva"));
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  };

  const navLink = (href: string, icon: React.ElementType, label: string, badge?: number) => {
    const Icon = icon;
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
          active
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className={cn(
            "text-xs font-medium tabular-nums px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-60 flex-shrink-0 h-full border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Banco de Ideas</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navLink("/inbox", Inbox, "Inbox", inboxCount)}
        {navLink("/acciones", ArrowRight, "Acciones")}
        {navLink("/proyectos", Rocket, "Proyectos")}
        {navLink("/ideas", Lightbulb, "Todas las ideas")}
        {navLink("/exportar", Sparkles, "Exportar a IA")}
        {navLink("/exportadas", CheckCheck, "Ideas exportadas")}
        {navLink("/categorias", FolderOpen, "Categorías")}
        {navLink("/dashboard", LayoutDashboard, "Dashboard")}

        {categories.length > 0 && (
          <div className="pt-4">
            <p className="px-3 pb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Categorías
            </p>
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] ?? Lightbulb;
              const active = pathname === `/ideas?categoryId=${cat.id}`;
              return (
                <Link
                  key={cat.id}
                  href={`/ideas?categoryId=${cat.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center" style={{ color: cat.color }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 truncate">{cat.name}</span>
                  {cat._count.ideas > 0 && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {cat._count.ideas}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
