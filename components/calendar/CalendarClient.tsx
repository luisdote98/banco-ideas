"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  color: string;
};

const COLORS = [
  { value: "#6366f1", label: "Violeta" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Naranja" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Púrpura" },
];

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function isoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CalendarClient() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // New event form
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newTitle, setNewTitle]       = useState("");
  const [newColor, setNewColor]       = useState(COLORS[0].value);
  const [saving, setSaving]           = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Edit event
  const [editId, setEditId]         = useState<string | null>(null);
  const [editTitle, setEditTitle]   = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const data = await res.json();
      setEvents(data.map((e: CalendarEvent) => ({ ...e, date: e.date.slice(0, 10) })));
    } catch {
      toast.error("Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (selectedDay) setTimeout(() => inputRef.current?.focus(), 80);
  }, [selectedDay]);

  // Build calendar grid (Mon–Sun)
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // Mon=0 ... Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells  = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= lastDay.getDate() ? day : null;
  });

  const eventsForDay = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === key);
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const openDay = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDay(key);
    setNewTitle("");
    setNewColor(COLORS[0].value);
    setEditId(null);
  };

  const addEvent = async () => {
    if (!newTitle.trim() || !selectedDay) return;
    setSaving(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), date: selectedDay, color: newColor }),
      });
      const ev = await res.json();
      setEvents(prev => [...prev, { ...ev, date: ev.date.slice(0, 10) }]);
      setNewTitle("");
      toast.success("Anotado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/calendar/${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      const updated = await res.json();
      setEvents(prev => prev.map(e => e.id === id ? { ...updated, date: updated.date.slice(0, 10) } : e));
      setEditId(null);
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const todayKey = isoDay(today);
  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : [];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Calendario</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Anota tareas y eventos en cada día</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold w-40 text-center">
            {MONTHS_ES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* Calendario */}
        <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden">
          {/* Cabecera días */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS_ES.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (!day) return (
                  <div key={`empty-${idx}`} className="min-h-[80px] md:min-h-[96px] border-b border-r border-border/50 bg-muted/20" />
                );

                const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsForDay(day);
                const isToday    = key === todayKey;
                const isSelected = key === selectedDay;
                const isWeekend  = (idx % 7) >= 5;

                return (
                  <button
                    key={key}
                    onClick={() => openDay(day)}
                    className={cn(
                      "min-h-[80px] md:min-h-[96px] border-b border-r border-border/50 p-1.5 text-left transition-colors",
                      "hover:bg-accent/40",
                      isSelected && "bg-primary/5 border-primary/30",
                      isWeekend && !isSelected && "bg-muted/10"
                    )}
                  >
                    <span className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : isWeekend
                          ? "text-muted-foreground"
                          : "text-foreground"
                    )}>
                      {day}
                    </span>

                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate"
                          style={{ backgroundColor: ev.color + "22", color: ev.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} más</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel lateral: detalle del día */}
        <div className="lg:w-72 rounded-2xl border border-border bg-card p-4 space-y-4 self-start sticky top-4">
          {!selectedDay ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Haz click en un día para añadir una tarea</p>
            </div>
          ) : (
            <>
              {/* Fecha seleccionada */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-ES", {
                      weekday: "long", day: "numeric", month: "long"
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedDayEvents.length} evento{selectedDayEvents.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Eventos del día */}
              {selectedDayEvents.length > 0 && (
                <div className="space-y-1.5">
                  {selectedDayEvents.map(ev => (
                    <div key={ev.id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 group">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                      {editId === ev.id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveEdit(ev.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          className="flex-1 text-sm bg-transparent focus:outline-none"
                        />
                      ) : (
                        <span
                          className="flex-1 text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => { setEditId(ev.id); setEditTitle(ev.title); }}
                        >
                          {ev.title}
                        </span>
                      )}
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        disabled={deletingId === ev.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        {deletingId === ev.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Añadir nuevo evento */}
              <div className="space-y-2 pt-1 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium pt-1">Añadir tarea</p>
                <input
                  ref={inputRef}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addEvent(); }}
                  placeholder="Escribe una tarea..."
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary/60 transition-colors"
                />

                {/* Selector de color */}
                <div className="flex items-center gap-1.5">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => setNewColor(c.value)}
                      className={cn(
                        "w-5 h-5 rounded-full transition-all",
                        newColor === c.value ? "ring-2 ring-offset-1 ring-foreground scale-110" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>

                <button
                  onClick={addEvent}
                  disabled={!newTitle.trim() || saving}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Añadir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
