import type { SubjectSlug, Year } from "@/lib/curriculum";
import { mulberry32, randomSeed, shuffle } from "@/lib/rng";
import { chineseBank } from "./chinese";
import { englishBank } from "./english";
import { mathsBank } from "./maths";
import { gsBank } from "./gs";
import { earlyYearsBanks } from "./early-years";
import { FILL_DISTRACTORS } from "./fill-choices";
import { yearFit, type ExerciseBank, type ExerciseItem, type FillItem, type MatchPair, type McItem } from "./types";

/** Append extra items per topic (keeps the base bank's items first). */
function withExtra(base: ExerciseBank, extra: ExerciseBank): ExerciseBank {
  const out: ExerciseBank = { ...base };
  for (const [topic, items] of Object.entries(extra)) out[topic] = [...(out[topic] ?? []), ...items];
  return out;
}

const BANKS: Record<SubjectSlug, ExerciseBank> = {
  chinese: withExtra(chineseBank, earlyYearsBanks.chinese),
  english: withExtra(englishBank, earlyYearsBanks.english),
  maths: withExtra(mathsBank, earlyYearsBanks.maths),
  gs: withExtra(gsBank, earlyYearsBanks.gs),
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

/** P1–P2: no typed word answers; P3: at most this many typed fills per session. */
export const P3_MAX_FILLS = 2;

/** A fill shown as mc: the canonical answer plus its hand-picked distractors (null if none). */
export function fillAsMc(item: FillItem): McItem | null {
  const wrong = FILL_DISTRACTORS[item.id];
  if (!wrong) return null;
  return {
    kind: "mc",
    id: item.id,
    ...(item.passage ? { passage: item.passage } : {}),
    prompt: item.prompt,
    choices: [item.accept[0], ...wrong],
    answerIndex: 0,
    ...(item.explanation ? { explanation: item.explanation } : {}),
    ...(item.years ? { years: item.years } : {}),
  };
}

/** Whole number 0–999: short enough for a P1–P2 child to type. */
function isShortWholeNumber(answer: number): boolean {
  return Number.isInteger(answer) && answer >= 0 && answer <= 999;
}

/**
 * Grade answer-type rules for the static bank (same policy as quizzes):
 * P1–P2 — fills become mc (dropped if no distractors), numbers only for 0–999
 * whole numbers; P3 — at most P3_MAX_FILLS typed fills, extra fills become mc.
 */
export function applyGradeRules(items: ExerciseItem[], year: Year): ExerciseItem[] {
  const early = year === "P1" || year === "P2";
  let fills = 0;
  return items.flatMap((item): ExerciseItem[] => {
    if (early && item.kind === "number" && !isShortWholeNumber(item.answer)) return [];
    if (item.kind !== "fill") return [item];
    if (year === "P3" && fills < P3_MAX_FILLS) {
      fills += 1;
      return [item];
    }
    if (!early && year !== "P3") return [item];
    const mc = fillAsMc(item);
    return mc ? [mc] : [];
  });
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

  // P1–P2: convert before picking so dropped items don't shorten the session.
  // P3: cap fills after picking so the cap applies to the items actually shown.
  const early = year === "P1" || year === "P2";
  const pool = early ? applyGradeRules(bank, year) : bank;
  const picked = applyGradeRules(pickForYear(rng, pool, year), year);
  return picked.flatMap((item): ExerciseItem[] => {
    if (item.kind === "mc") return [shuffleMcChoices(rng, item)];
    if (item.kind !== "match") return [item];
    const pairs = pickForYear(rng, item.pairs, year);
    return pairs.length ? [{ ...item, pairs }] : [];
  });
}
