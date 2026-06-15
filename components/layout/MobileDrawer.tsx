"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X, Lightbulb, LayoutDashboard,
  Briefcase, Code2, Palette, Megaphone,
  Plane, Newspaper, Target, FlaskConical, BookOpen, LogOut, Sparkles, Rocket, CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, "code-2": Code2, palette: Palette,
  megaphone: Megaphone, plane: Plane, newspaper: Newspaper,
  target: Target, rocket: Rocket, "flask-conical": FlaskConical,
  "book-open": BookOpen, lightbulb: Lightbulb,
};

type Category = {
  id: string; name: string; slug: string; icon: string; color: string;
  _count: { ideas: number };
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onLogout?: () => void;
};

export function MobileDrawer({ open, onClose, categories, onLogout }: Props) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const navItem = (href: string, Icon: React.ElementType, label: string, badge?: number) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-foreground/70 active:bg-accent"
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border flex flex-col animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Banco de Ideas</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItem("/ideas", Lightbulb, "Todas las ideas")}
          {navItem("/exportar", Sparkles, "Exportar a IA")}
          {navItem("/procesadas", CheckCheck, "Ideas procesadas")}
          {navItem("/dashboard", LayoutDashboard, "Dashboard")}

          {categories.filter(c => c._count.ideas > 0).length > 0 && (
            <div className="pt-4">
              <p className="px-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Categorías
              </p>
              {categories.filter(c => c._count.ideas > 0).map((cat) => {
                const Icon = iconMap[cat.icon] ?? Lightbulb;
                return (
                  <Link
                    key={cat.id}
                    href={`/ideas?categoryId=${cat.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/70 active:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: cat.color }} />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat._count.ideas}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
        {/* Logout */}
        <div className="p-3 border-t border-border mt-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-muted-foreground active:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
