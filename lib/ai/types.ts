export type AIProvider = "claude" | "openai" | "none";

export type IdeaAnalysis = {
  summary: string;
  suggestedTags: string[];
  suggestedCategory?: string;
  score: number;
  reasoning: string;
};

export type AIServiceConfig = {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
};

export interface AIService {
  analyzeIdea(title: string, description?: string): Promise<IdeaAnalysis>;
  suggestNextStep(title: string, description?: string): Promise<string>;
  findSimilarIdeas(title: string, allTitles: string[]): Promise<string[]>;
}
