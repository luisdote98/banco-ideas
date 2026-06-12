export type ParsedIdea = {
  title: string;
  description: string;
  nextStep: string;
  status: string;
};

const STATUS_MAP: Record<string, string> = {
  "borrador": "DRAFT",
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

  // Split por bloques de idea: "IDEA N —" o "IDEA N -"
  const blocks = text.split(/(?=IDEA\s+\d+\s*[—\-–])/i).filter(b => b.trim());

  for (const block of blocks) {
    // Título: primera línea después de "IDEA N —"
    const titleMatch = block.match(/^IDEA\s+\d+\s*[—\-–]\s*(.+)/im);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    // Estado
    const statusMatch = block.match(/estado[:\s]+([^\n|]+)/i);
    const status = statusMatch ? parseStatus(statusMatch[1]) : "DRAFT";

    // Descripción mejorada
    const descMatch = block.match(
      /descripci[oó]n mejorada[:\s]*\n([\s\S]*?)(?=\npróximo paso|$)/i
    );
    const description = descMatch
      ? descMatch[1].trim().replace(/\n{3,}/g, "\n\n")
      : "";

    // Próximo paso
    const nextStepMatch = block.match(
      /próximo paso[^:\n]*[:\s]*\n([\s\S]*?)(?=\nIDEA\s+\d+|$)/i
    );
    const nextStep = nextStepMatch
      ? nextStepMatch[1].trim().split("\n")[0].trim()
      : "";

    if (title) {
      ideas.push({ title, description, nextStep, status });
    }
  }

  return ideas;
}
