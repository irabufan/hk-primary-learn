import type { SubjectSlug, Year } from "@/lib/curriculum";
import { mulberry32, randomSeed, shuffle } from "@/lib/rng";
import { chineseBank } from "./chinese";
import { englishBank } from "./english";
import { mathsBank } from "./maths";
import { gsBank } from "./gs";
import { suitsYear, type ExerciseBank, type ExerciseItem, type McItem } from "./types";

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
 * Build one exercise session for a subject + topic + year:
 * items that suit the year come first, everything is shuffled, MC choices are
 * shuffled, and a match item is trimmed to a playful number of pairs.
 */
export function getExerciseSession(
  subject: SubjectSlug,
  topic: string,
  year: Year,
): ExerciseItem[] {
  const bank = getBank(subject, topic) ?? [];
  const rng = mulberry32(randomSeed());

  const preferred = shuffle(
    rng,
    bank.filter((item) => suitsYear(item, year)),
  );
  const others = shuffle(
    rng,
    bank.filter((item) => !suitsYear(item, year)),
  );

  const picked = [...preferred, ...others].slice(0, SESSION_SIZE);

  return picked.map((item) => {
    if (item.kind === "mc") return shuffleMcChoices(rng, item);
    if (item.kind !== "match") return item;
    const goodPairs = shuffle(
      rng,
      item.pairs.filter((pair) => suitsYear(pair, year)),
    );
    const otherPairs = shuffle(
      rng,
      item.pairs.filter((pair) => !suitsYear(pair, year)),
    );
    return { ...item, pairs: [...goodPairs, ...otherPairs].slice(0, SESSION_SIZE) };
  });
}
