import type { SubjectSlug, Year } from "@/lib/curriculum";
import type { Localized } from "@/lib/i18n/types";

export type QuizQuestionType = "mc" | "fill" | "number";

export type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  prompt: Localized;
  passage?: Localized;
  /** Present for "mc" questions. */
  choices?: string[];
  /** Canonical answer: exact choice text (mc), accepted word (fill), or number string (number). */
  answer: string;
  /** Extra accepted spellings for "fill" questions (the answer is always included). */
  accepts?: string[];
  hint?: Localized;
  explanation?: Localized;
};

export type Quiz = {
  id: string;
  subject: SubjectSlug;
  topic: string;
  year: Year;
  questions: QuizQuestion[];
  seed: number;
};

export const QUIZ_COUNTS = [5, 8, 10] as const;

export type QuizCount = (typeof QUIZ_COUNTS)[number];

export type QuizRequest = {
  subject: SubjectSlug;
  topic: string;
  year: Year;
  count: number;
  /** Changing the seed changes the quiz. */
  seed: number;
};

/** The seam the UI depends on — a real LLM adapter can implement the same shape. */
export interface QuizGenerator {
  generate(request: QuizRequest): Promise<Quiz>;
}

/** One answered question, kept for the results review. */
export type QuizAnswer = {
  questionId: string;
  given: string;
  correct: boolean;
};

export type QuizResult = {
  correct: number;
  total: number;
  answers: QuizAnswer[];
};
