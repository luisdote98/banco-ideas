/**
 * AI service stub — ready to connect Claude or OpenAI.
 * Swap `NullAIService` for `ClaudeAIService` or `OpenAIService` when keys are available.
 */

import type { AIService, IdeaAnalysis } from "./types";

class NullAIService implements AIService {
  async analyzeIdea(): Promise<IdeaAnalysis> {
    return { summary: "", suggestedTags: [], score: 0, reasoning: "AI not configured" };
  }
  async suggestNextStep(): Promise<string> {
    return "";
  }
  async findSimilarIdeas(_title: string, _all: string[]): Promise<string[]> {
    return [];
  }
}

// Singleton — replace NullAIService with real implementation later
export const aiService: AIService = new NullAIService();

export function isAIEnabled(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}
