import type { Year } from "@/lib/curriculum";
import type { Localized } from "@/lib/i18n/types";

/** A word ↔ meaning pair for the match-pairs game. */
export type MatchPair = {
  id: string;
  left: string;
  right: string;
  years?: Year[];
};

/** Callback fired once per answered question. `given` is the player's raw answer. */
export type OnAnswered = (correct: boolean, given: string) => void;

export type McItem = {
  kind: "mc";
  id: string;
  passage?: Localized;
  prompt: Localized;
  choices: string[];
  answerIndex: number;
  explanation?: Localized;
  years?: Year[];
};

export type FillItem = {
  kind: "fill";
  id: string;
  passage?: Localized;
  prompt: Localized;
  hint?: Localized;
  /** Accepted answers; the first is treated as canonical. */
  accept: string[];
  explanation?: Localized;
  years?: Year[];
};

export type NumberItem = {
  kind: "number";
  id: string;
  prompt: Localized;
  answer: number;
  tolerance?: number;
  unit?: Localized;
  explanation?: Localized;
  years?: Year[];
};

export type MatchItem = {
  kind: "match";
  id: string;
  title: Localized;
  pairs: MatchPair[];
};

export type ExerciseItem = McItem | FillItem | NumberItem | MatchItem;

/** Topic slug → items, per subject. */
export type ExerciseBank = Record<string, ExerciseItem[]>;

/** Untagged items suit every year; tagged items suit only the listed years. */
export function suitsYear(item: { years?: Year[] } | ExerciseItem, year: Year): boolean {
  const years = "years" in item ? item.years : undefined;
  return !years || years.includes(year);
}
