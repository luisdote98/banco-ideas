"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Lightbulb, Rocket, Loader2, Inbox, LayoutDashboard, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  title: string;
  status: string;
  type: string;
  category: { name: string; color: string } | null;
};

const NAV_ITEMS = [
  { href: "/ideas/nueva", label: "Captura rápida", icon: Zap, hint: "Nueva idea" },
  { href: "/inbox", label: "Inbox", icon: Inbox, hint: "Ir a Inbox" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Ver estadísticas" },
];

type Props = { forceOpen?: boolean; onClose?: () => void };

export function CommandPalette({ forceOpen, onClose }: Props = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) onClose?.();
  };
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setSelected(0);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const visibleNavItems = query.length < 2
    ? NAV_ITEMS
    : NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()));

  const allItems = [...visibleNavItems.map((n) => ({ href: n.href })), ...results.map((r) => ({ href: `/ideas/${r.id}` }))];

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && allItems[selected]) navigate(allItems[selected].href);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selected, allItems, navigate]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ideas, proyectos..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-xs text-muted-foreground/60 border border-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {/* Nav shortcuts */}
          {visibleNavItems.length > 0 && (
            <div>
              {query.length < 2 && (
                <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones rápidas
                </p>
              )}
              {visibleNavItems.map((item, i) => {
                const Icon = item.icon;
                const isSelected = selected === i;
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div>
              <p className="px-4 py-1.5 mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ideas
              </p>
              {results.map((idea, i) => {
                const idx = visibleNavItems.length + i;
                const isSelected = selected === idx;
                const Icon = idea.type === "PROJECT" ? Rocket : Lightbulb;
                return (
                  <button
                    key={idea.id}
                    onClick={() => navigate(`/ideas/${idea.id}`)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{idea.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {idea.category && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ color: idea.category.color, backgroundColor: `${idea.category.color}18` }}
                        >
                          {idea.category.name}
                        </span>
                      )}
                      <StatusBadge status={idea.status} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !loading && (
            <p className="px-4 py-8 text-sm text-center text-muted-foreground">
              Sin resultados para <span className="font-medium">"{query}"</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground/60">
          <span><kbd className="border border-border rounded px-1">↑↓</kbd> navegar</span>
          <span><kbd className="border border-border rounded px-1">↵</kbd> abrir</span>
          <span><kbd className="border border-border rounded px-1">Esc</kbd> cerrar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
