/**
 * Grade-based answer types for LLM quizzes, enforced after parsing.
 *
 *   P1–P2: mc + match; number only for short maths answers (whole numbers ≤ 3 digits); no fill.
 *   P3:    mostly mc + match; at most 2 fill items (marked leniently); number for maths only.
 *   P4–P6: mc / fill / number as before; at most 1 match item.
 *
 * Every mc item must end with 4 distinct choices that contain the answer;
 * every match item must have 4–5 pairs with unique lefts and rights.
 * Items that break a rule are converted to mc when distractors exist, otherwise dropped
 * (the caller backfills).
 */

import type { SubjectSlug, Year } from "@/lib/curriculum";
import { mulberry32, shuffle, type Rng } from "@/lib/rng";
import { answersEqual, lenientKey, parseNumericAnswer } from "./answers";
import type { QuizMatchPair, QuizQuestion } from "./types";

export const MC_CHOICES = 4;
export const MATCH_MIN_PAIRS = 4;
export const MATCH_MAX_PAIRS = 5;

export type GradePolicy = {
  /** Max fill items per quiz. */
  maxFill: number;
  /** Max match items per quiz. */
  maxMatch: number;
  /** Is a number item allowed for this subject/answer? */
  allowNumber: (subject: SubjectSlug, answer: string) => boolean;
};

const SHORT_WHOLE_NUMBER = /^\d{1,3}$/;

export function gradePolicy(year: Year): GradePolicy {
  if (year === "P1" || year === "P2") {
    return {
      maxFill: 0,
      maxMatch: 2,
      allowNumber: (subject, answer) => subject === "maths" && SHORT_WHOLE_NUMBER.test(answer.trim()),
    };
  }
  if (year === "P3") {
    return { maxFill: 2, maxMatch: 2, allowNumber: (subject) => subject === "maths" };
  }
  return { maxFill: Infinity, maxMatch: 1, allowNumber: () => true };
}

/** Prompt block describing the allowed answer types for the year. */
export function answerTypeGuidance(year: Year, subject: SubjectSlug): string {
  const matchIdeas =
    subject === "chinese"
      ? "量詞↔名詞, 詞語↔意思, 近義詞/反義詞"
      : subject === "english"
        ? "English word ↔ 中文意思, word ↔ picture-word category, opposite ↔ opposite"
        : subject === "maths"
          ? "number ↔ 中文數字 / number word, sum ↔ result, shape ↔ number of sides, time ↔ words"
          : "動物↔居所, 物品↔用途, 職業↔工作地點, 食物↔食物類別";
  const matchShape =
    'A "match" item has a short instruction prompt and "pairs": 4–5 {"left","right"} objects; every left and every right must be unique, each right fits exactly one left (no ambiguous pairs), each side ≤ 8 字 / 3 English words. Leave out "answer" and "choices" for match.';
  if (year === "P1" || year === "P2") {
    return [
      `ANSWER TYPES (${year} — CRITICAL):`,
      '- Use only type "mc" and type "match".',
      subject === "maths"
        ? '- type "number" is allowed only when the answer is a whole number of at most 3 digits (0–999).'
        : '- Do NOT use type "number".',
      '- NEVER use type "fill" (young pupils cannot type Chinese/English answers). Write any fill-in-the-blank as mc with 4 choices instead.',
      `- Include 1–2 match items when the topic suits pairing (e.g. ${matchIdeas}); all other items mc.`,
      `- ${matchShape}`,
    ].join("\n");
  }
  if (year === "P3") {
    return [
      "ANSWER TYPES (P3 — CRITICAL):",
      '- Mostly type "mc".',
      '- At most 2 items of type "fill", only for short answers (one word / 1–4 字). For each fill: list every acceptable alternate in "accepts" (e.g. with and without 一: "一首" and "首"; synonyms), and also give "choices": the answer plus 3 plausible wrong options.',
      subject === "maths" ? '- type "number" is fine for numeric answers.' : '- Do NOT use type "number".',
      `- Include 1–2 match items when the topic suits pairing (e.g. ${matchIdeas}).`,
      `- ${matchShape}`,
    ].join("\n");
  }
  return [
    `ANSWER TYPES (${year}):`,
    '- Use mc, fill and number as they fit the topic.',
    `- At most 1 match item, only when the topic naturally suits pairing (e.g. ${matchIdeas}); 0 is fine.`,
    `- ${matchShape}`,
  ].join("\n");
}

/** Key for "same choice" checks: numeric value for numbers, lenient text otherwise. */
function choiceKey(choice: string): string {
  const n = parseNumericAnswer(choice);
  return n !== null ? `#${n}` : lenientKey(choice);
}

/** Nearby whole numbers as distractors for an integer answer. */
function numericDistractors(answer: string, rng: Rng): string[] {
  const n = parseNumericAnswer(answer);
  if (n === null || !Number.isInteger(n) || !/^-?\d+$/.test(answer.trim())) return [];
  const offsets = shuffle(rng, [1, -1, 2, -2, 10, -10, 3, -3, 5, -5]);
  const out: string[] = [];
  for (const d of offsets) {
    const v = n + d;
    if (v < 0 && n >= 0) continue;
    out.push(String(v));
  }
  return out;
}

/**
 * Build a valid mc item (4 distinct choices containing the answer) from a question's
 * answer and candidate choices, topping up with nearby numbers for integer answers.
 * Returns null when no valid set can be made.
 */
export function repairMc(q: QuizQuestion, rng: Rng): QuizQuestion | null {
  const candidates = (q.choices ?? []).map((c) => c.trim()).filter(Boolean);
  let answer = q.answer.trim();
  // Model answered with a letter ("B") instead of the choice text.
  const letter = answer.match(/^\(?([A-Fa-f])\)?$/);
  if (letter && !candidates.includes(answer)) {
    answer = candidates[letter[1].toUpperCase().charCodeAt(0) - 65] ?? answer;
  }
  if (!answer) return null;
  // Use the choice's exact text when the model's answer only differs in formatting.
  const hit = candidates.find((c) => c === answer) ?? candidates.find((c) => answersEqual(c, answer) || choiceKey(c) === choiceKey(answer));
  const canonical = hit ?? answer;
  const seen = new Set([choiceKey(canonical)]);
  const distractors: string[] = [];
  for (const c of [...candidates, ...numericDistractors(canonical, rng)]) {
    const key = choiceKey(c);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(c);
    if (distractors.length === MC_CHOICES - 1) break;
  }
  if (distractors.length < MC_CHOICES - 1) return null;
  const next: QuizQuestion = {
    ...q,
    type: "mc",
    answer: canonical,
    choices: shuffle(rng, [canonical, ...distractors]),
  };
  delete next.accepts;
  return next;
}

/** 4–5 pairs with unique (lenient) lefts and rights, or null. */
export function cleanMatchPairs(pairs: QuizMatchPair[] | undefined): QuizMatchPair[] | null {
  const lefts = new Set<string>();
  const rights = new Set<string>();
  const out: QuizMatchPair[] = [];
  for (const p of pairs ?? []) {
    const left = p.left?.trim();
    const right = p.right?.trim();
    if (!left || !right) continue;
    const l = lenientKey(left);
    const r = lenientKey(right);
    if (!l || !r || lefts.has(l) || rights.has(r)) continue;
    lefts.add(l);
    rights.add(r);
    out.push({ left, right });
    if (out.length === MATCH_MAX_PAIRS) break;
  }
  return out.length >= MATCH_MIN_PAIRS ? out : null;
}

export function matchAnswerKey(pairs: QuizMatchPair[]): string {
  return pairs.map((p) => `${p.left} → ${p.right}`).join("; ");
}

/**
 * Apply the year's answer-type rules. Order is kept; invalid items are repaired
 * (→ mc) or dropped, so the result may be shorter than the input.
 */
export type RuleStats = { toMc: number; repairedMc: number; dropped: number; droppedTypes?: string[] };

export function enforceAnswerTypes(
  questions: QuizQuestion[],
  opts: { year: Year; subject: SubjectSlug; seed: number },
  stats: RuleStats = { toMc: 0, repairedMc: 0, dropped: 0 },
): QuizQuestion[] {
  const policy = gradePolicy(opts.year);
  const drop = (q: QuizQuestion) => {
    stats.dropped += 1;
    (stats.droppedTypes ??= []).push(q.type);
  };
  let fills = 0;
  let matches = 0;
  const out: QuizQuestion[] = [];

  questions.forEach((q, i) => {
    const rng = mulberry32((opts.seed >>> 0) + Math.imul(i + 1, 9973));

    if (q.type === "match") {
      const pairs = cleanMatchPairs(q.pairs);
      if (!pairs || matches >= policy.maxMatch) {
        drop(q);
        return;
      }
      matches += 1;
      const next: QuizQuestion = { ...q, pairs: shuffle(rng, pairs), answer: matchAnswerKey(pairs) };
      delete next.choices;
      delete next.accepts;
      out.push(next);
      return;
    }

    if (q.type === "mc") {
      const fixed = repairMc(q, rng);
      if (!fixed) drop(q);
      else {
        const before = q.choices ?? [];
        const changed = before.length !== MC_CHOICES || !before.includes(fixed.answer) ||
          fixed.choices!.some((c) => !before.includes(c));
        if (changed) stats.repairedMc += 1;
        out.push(fixed);
      }
      return;
    }

    if (q.type === "number") {
      if (policy.allowNumber(opts.subject, q.answer)) {
        const next = { ...q };
        delete next.choices;
        out.push(next);
        return;
      }
      const asMc = repairMc(q, rng);
      if (asMc) {
        stats.toMc += 1;
        out.push(asMc);
      } else drop(q);
      return;
    }

    // fill
    if (fills < policy.maxFill) {
      fills += 1;
      const next = { ...q };
      delete next.choices;
      out.push(next);
      return;
    }
    const asMc = repairMc(q, rng);
    if (asMc) {
      stats.toMc += 1;
      out.push(asMc);
    } else drop(q);
  });

  return out;
}
