"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Zap, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommandPalette } from "./CommandPalette";

export function BottomNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <CommandPalette forceOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        {/* Safe area for iPhone */}
        <div className="flex items-stretch h-16 pb-safe">

          {/* Ideas */}
          <NavItem href="/ideas" label="Ideas" isActive={isActive("/ideas") && !isActive("/ideas/nueva")}>
            <Lightbulb className="w-5 h-5" />
          </NavItem>

          {/* Capture — center, prominent */}
          <div className="flex-1 flex items-center justify-center">
            <Link
              href="/ideas/nueva"
              className="flex items-center justify-center w-14 h-14 -mt-5 rounded-full bg-primary shadow-lg shadow-primary/30 text-primary-foreground active:scale-95 transition-transform"
            >
              <Zap className="w-6 h-6" />
            </Link>
          </div>

          {/* Search */}
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground active:text-foreground transition-colors"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Buscar</span>
          </button>

        </div>
      </nav>
    </>
  );
}

function NavItem({
  href, label, isActive, children,
}: {
  href: string;
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
      )}
    >
      {children}
      <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
        {label}
      </span>
    </Link>
  );
}
