import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  color?: string | null;
  onRemove?: () => void;
  size?: "sm" | "md";
};

export function TagPill({ name, onRemove, size = "md" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted font-medium text-muted-foreground",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      #{name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
