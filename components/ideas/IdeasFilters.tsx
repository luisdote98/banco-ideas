"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Category, Tag } from "@/types";

type Filters = {
  q: string;
  categoryId: string;
  status: string;
  tagId: string;
  orderBy: string;
};

type Props = {
  categories: Category[];
  tags: Tag[];
  currentFilters: Filters;
};

export function IdeasFilters({ categories, tags, currentFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const hasFilters =
    !!(currentFilters.q || currentFilters.categoryId || currentFilters.status || currentFilters.tagId);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
      const merged = { ...currentFilters, [key]: value };
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [currentFilters, pathname, router]
  );

  const clear = () => {
    startTransition(() => router.push(pathname));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          defaultValue={currentFilters.q}
          onChange={(e) => {
            const v = e.target.value;
            const t = setTimeout(() => update("q", v), 300);
            return () => clearTimeout(t);
          }}
          placeholder="Buscar ideas..."
          className="pl-9"
        />
      </div>

      {/* Category */}
      <Select
        value={currentFilters.categoryId || "_all"}
        onValueChange={(v) => update("categoryId", !v || v === "_all" ? "" : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={currentFilters.status || "_all"}
        onValueChange={(v) => update("status", !v || v === "_all" ? "" : v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todos los estados</SelectItem>
          <SelectItem value="DRAFT">Borrador</SelectItem>
          <SelectItem value="ACTIVE">Activa</SelectItem>
          <SelectItem value="INCUBATING">Incubando</SelectItem>
          <SelectItem value="ARCHIVED">Archivada</SelectItem>
        </SelectContent>
      </Select>

      {/* Order */}
      <Select
        value={currentFilters.orderBy || "createdAt_desc"}
        onValueChange={(v) => { if (v) update("orderBy", v); }}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt_desc">Más recientes</SelectItem>
          <SelectItem value="createdAt_asc">Más antiguas</SelectItem>
          <SelectItem value="scorePotential_desc">Mayor potencial</SelectItem>
          <SelectItem value="scoreInterest_desc">Mayor interés</SelectItem>
          <SelectItem value="title_asc">Alfabético</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="gap-1.5 text-muted-foreground">
          <X className="w-3.5 h-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
