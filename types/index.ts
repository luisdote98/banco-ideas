import type { Idea, Category, Tag, IdeaHistory } from "@prisma/client";

export type { Idea, Category, Tag, IdeaHistory };

export type IdeaStatus = "DRAFT" | "ACTIVE" | "INCUBATING" | "ARCHIVED";
export type IdeaType = "IDEA" | "PROJECT";

export type IdeaWithRelations = Idea & {
  category: Category | null;
  tags: { tag: Tag }[];
  history?: IdeaHistory[];
};

export type CategoryWithCount = Category & {
  _count: { ideas: number };
};

export type IdeaFormData = {
  title: string;
  description?: string;
  nextStep?: string;
  categoryId?: string;
  status: IdeaStatus;
  type?: IdeaType;
  scorePotential: number;
  scoreEffort: number;
  scoreInterest: number;
  tags: string[];
};

export type SearchResult = {
  id: string;
  title: string;
  status: string;
  type: string;
  category: Category | null;
  updatedAt: Date;
};
