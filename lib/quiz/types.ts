import type { SubjectSlug, Year } from "@/lib/curriculum";
import type { Localized } from "@/lib/i18n/types";

export type QuizQuestionType = "mc" | "fill" | "number" | "match";

/** One left ↔ right pair of a "match" question. */
export type QuizMatchPair = { left: string; right: string };

export type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  prompt: Localized;
  passage?: Localized;
  /** Present for "mc" questions. */
  choices?: string[];
  /** Present for "match" questions: 4–5 pairs, unique lefts and rights. */
  pairs?: QuizMatchPair[];
  /**
   * Canonical answer: exact choice text (mc), accepted word (fill), number string (number),
   * or a readable "left → right; …" key (match — scoring uses pairs, not this string).
   */
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
  /**
   * Optional stems from a previous quiz (regenerate). The model should avoid
   * reusing these; omit on first-time generate.
   */
  avoidPrompts?: string[];
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
