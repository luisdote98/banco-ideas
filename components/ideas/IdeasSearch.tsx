"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";

export function IdeasSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const update = (q: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => {
          clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st);
          (window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => update(e.target.value), 300);
        }}
        placeholder="Buscar ideas..."
        className="w-full h-10 pl-10 pr-10 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary/60 transition-colors"
      />
      {defaultValue && (
        <button
          onClick={() => { router.push(pathname); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
