import type { SubjectSlug, Year } from "@/lib/curriculum";
import { mulberry32, randomSeed, shuffle } from "@/lib/rng";
import { chineseBank } from "./chinese";
import { englishBank } from "./english";
import { mathsBank } from "./maths";
import { gsBank } from "./gs";
import { yearFit, type ExerciseBank, type ExerciseItem, type MatchPair, type McItem } from "./types";

const BANKS: Record<SubjectSlug, ExerciseBank> = {
  chinese: chineseBank,
  english: englishBank,
  maths: mathsBank,
  gs: gsBank,
};

/** How many questions (or pairs) make one exercise session. */
export const SESSION_SIZE = 6;

/** Raw authored bank for a subject + topic (ordered, unshuffled). */
export function getBank(subject: SubjectSlug, topic: string): ExerciseItem[] | undefined {
  return BANKS[subject]?.[topic];
}

/** Shuffle MC choices with a seeded RNG; keep answerIndex pointing at the correct choice. */
export function shuffleMcChoices(rng: () => number, item: McItem): McItem {
  const order = shuffle(
    rng,
    item.choices.map((_, index) => index),
  );
  return {
    ...item,
    choices: order.map((index) => item.choices[index]),
    answerIndex: order.indexOf(item.answerIndex),
  };
}

/**
 * Exact-year items first, then adjacent-grade (±1) items; each tier shuffled.
 * Items from grades further away are never used — a short session beats a
 * P1 child meeting P5 work.
 */
function pickForYear<T extends ExerciseItem | MatchPair>(
  rng: () => number,
  items: T[],
  year: Year,
): T[] {
  const exact = shuffle(rng, items.filter((item) => yearFit(item, year) === 0));
  const adjacent = shuffle(rng, items.filter((item) => yearFit(item, year) === 1));
  return [...exact, ...adjacent].slice(0, SESSION_SIZE);
}

/**
 * Build one exercise session for a subject + topic + year: exact-year items,
 * topped up from adjacent grades only (may be shorter than SESSION_SIZE),
 * MC choices shuffled, and a match item trimmed to a playful number of pairs.
 */
export function getExerciseSession(
  subject: SubjectSlug,
  topic: string,
  year: Year,
): ExerciseItem[] {
  const bank = getBank(subject, topic) ?? [];
  const rng = mulberry32(randomSeed());

  return pickForYear(rng, bank, year).flatMap((item): ExerciseItem[] => {
    if (item.kind === "mc") return [shuffleMcChoices(rng, item)];
    if (item.kind !== "match") return [item];
    const pairs = pickForYear(rng, item.pairs, year);
    return pairs.length ? [{ ...item, pairs }] : [];
  });
}
