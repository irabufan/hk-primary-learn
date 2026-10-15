import type { SubjectId, Year } from "@/lib/curriculum";

export type QuestionType = "mc" | "fill" | "number";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  choices?: string[];
  answer: string | number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  subject: SubjectId;
  topic: string;
  year: Year;
  questions: QuizQuestion[];
  seed: number;
};

export type GenerateOpts = {
  subject: SubjectId;
  topic: string;
  year: Year;
  count: number;
  seed?: number;
};

/** Swap implementations without rewriting the quiz UI. */
export interface QuizGenerator {
  generate(opts: GenerateOpts): Promise<Quiz>;
}
