"use client";

import { Moon, Sun, Zap, Search, Menu, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./CommandPalette";
import { MobileDrawer } from "./MobileDrawer";
import { useState } from "react";

type Category = {
  id: string; name: string; slug: string; icon: string; color: string;
  _count: { ideas: number };
};

type Props = {
  categories?: Category[];
};

export function Header({ categories = [] }: Props) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const triggerSearch = () => setSearchOpen(true);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <CommandPalette forceOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        onLogout={handleLogout}
      />

      <header className="h-12 border-b border-border px-3 md:px-4 flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur-md sticky top-0 z-40">

        {/* Mobile: hamburger */}
        <button
          className="md:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop: search bar */}
        <button
          onClick={triggerSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-56"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Buscar ideas...</span>
          <kbd className="text-xs border border-border/60 rounded px-1 bg-background">⌘K</kbd>
        </button>

        {/* Mobile: app title */}
        <span className="md:hidden text-sm font-semibold tracking-tight">Banco de Ideas</span>

        <div className="flex items-center gap-1.5">
          {/* Mobile: search icon */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={triggerSearch}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop: quick capture */}
          <Link href="/ideas/nueva" className="hidden md:flex">
            <Button size="sm" className="gap-1.5 h-8 text-xs">
              <Zap className="w-3.5 h-3.5" />
              Captura rápida
            </Button>
          </Link>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Logout — desktop only (mobile has it in drawer) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex w-8 h-8 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
    </>
  );
}
