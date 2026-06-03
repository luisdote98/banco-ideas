import { Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { IdeaHistory as IdeaHistoryType } from "@/types";

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  description: "Descripción",
  status: "Estado",
  nextStep: "Próximo paso",
  categoryId: "Categoría",
  type: "Tipo",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  INCUBATING: "Incubando",
  ARCHIVED: "Archivada",
};

const TYPE_LABELS: Record<string, string> = {
  IDEA: "Idea",
  PROJECT: "Proyecto",
};

function formatValue(field: string, value: string | null): string {
  if (value === null || value === "") return "—";
  if (field === "status") return STATUS_LABELS[value] ?? value;
  if (field === "type") return TYPE_LABELS[value] ?? value;
  if (value.length > 60) return value.slice(0, 60) + "…";
  return value;
}

type Props = {
  history: IdeaHistoryType[];
};

export function IdeaHistoryTimeline({ history }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5" />
        Historial de cambios
      </div>
      <div className="space-y-2">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {FIELD_LABELS[entry.field] ?? entry.field}
                </span>
                {" cambiado de "}
                <span className="font-mono bg-muted px-1 rounded">
                  {formatValue(entry.field, entry.oldValue)}
                </span>
                {" a "}
                <span className="font-mono bg-muted px-1 rounded">
                  {formatValue(entry.field, entry.newValue)}
                </span>
              </span>
            </div>
            <span className="text-muted-foreground/60 shrink-0 tabular-nums">
              {timeAgo(entry.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
