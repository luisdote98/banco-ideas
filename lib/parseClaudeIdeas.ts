export type ParsedIdea = {
  title: string;
  description: string;
  nextStep: string;
  status: string;
};

const STATUS_MAP: Record<string, string> = {
  "borrador": "DRAFT",
  "sin realizar": "DRAFT",
  "activa": "ACTIVE",
  "activo": "ACTIVE",
  "incubando": "INCUBATING",
  "archivada": "ARCHIVED",
};

function parseStatus(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [key, value] of Object.entries(STATUS_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "DRAFT";
}

export function parseClaudeOutput(text: string): ParsedIdea[] {
  const ideas: ParsedIdea[] = [];

  // Split en bloques: "IDEA N —" o "IDEA N -" o "IDEA N:"
  const blocks = text.split(/(?=IDEA\s+\d+\s*[—\-–:])/i).filter(b => b.trim());

  for (const block of blocks) {
    // Título: primera línea después de "IDEA N —"
    const titleMatch = block.match(/^IDEA\s+\d+\s*[—\-–:]\s*(.+)/im);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    // Estado: busca "Estado:" (puede ir seguido de "|")
    const statusMatch = block.match(/estado[:\s]+([^|\n]+)/i);
    const status = statusMatch ? parseStatus(statusMatch[1]) : "DRAFT";

    // Próximo paso: busca cualquier variante del label
    const nextStepMatch = block.match(
      /próximo paso[^:\n]*:\s*\n?([\s\S]*?)(?=\n\s*\n\s*IDEA\s+\d+|$)/i
    );
    const nextStep = nextStepMatch ? nextStepMatch[1].trim() : "";

    // Descripción: todo lo que hay entre la línea de Estado/Puntuación y "Próximo paso"
    // Eliminamos la primera línea (IDEA N — título) y la línea de estado
    const withoutHeader = block
      .replace(/^IDEA\s+\d+\s*[—\-–:]\s*.+\n?/im, "")   // quita línea de título
      .replace(/estado[:\s]+[^\n]+\n?/i, "");              // quita línea de estado

    // Ahora recortamos desde el inicio hasta "Próximo paso"
    const descRaw = withoutHeader.replace(
      /\n?próximo paso[^:\n]*:[\s\S]*/i, ""
    ).trim();

    // Limpiar líneas vacías excesivas
    const description = descRaw.replace(/\n{3,}/g, "\n\n");

    if (title) {
      ideas.push({ title, description, nextStep, status });
    }
  }

  return ideas;
}
