import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  hexColor?: string;
  showValue?: boolean;
  size?: "sm" | "md";
};

export function ScoreBar({
  label,
  value,
  hexColor = "#6366f1",
  showValue = true,
  size = "md",
}: Props) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {showValue && (
          <span className={cn("tabular-nums font-medium", size === "sm" ? "text-xs" : "text-sm")}>
            {value}/10
          </span>
        )}
      </div>
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", size === "sm" ? "h-1.5" : "h-2")}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: hexColor }}
        />
      </div>
    </div>
  );
}
