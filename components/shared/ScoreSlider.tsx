"use client";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  accentColor?: string;
};

export function ScoreSlider({ label, description, value, onChange, accentColor = "hsl(var(--primary))" }: Props) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <span
          className="text-2xl font-semibold tabular-nums w-8 text-right transition-all"
          style={{ color: accentColor }}
        >
          {value}
        </span>
      </div>
      <div className="relative flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-4 shrink-0">1</span>
        <div className="relative flex-1">
          <input
            type="range"
            min={1}
            max={10}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(
              "w-full h-1.5 rounded-full appearance-none cursor-pointer",
              "bg-muted",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
              "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-sm",
              "[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing",
              "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            )}
            style={{
              background: `linear-gradient(to right, ${accentColor} ${pct}%, hsl(var(--muted)) ${pct}%)`,
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              border-color: ${accentColor};
            }
          `}</style>
        </div>
        <span className="text-xs text-muted-foreground w-4 shrink-0 text-right">10</span>
      </div>
    </div>
  );
}
