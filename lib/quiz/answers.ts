import { normalizeAnswer } from "@/lib/i18n/types";
import type { QuizQuestion } from "./types";

const FRACTION_RE = /^(-?\d+)\s*\/\s*(-?\d+)$/;
const PLAIN_NUMBER_RE = /^-?\d+(\.\d+)?$/;

/** Parse "a/b" or "a / b" into a numeric value, or null if not a fraction. */
export function parseFraction(raw: string): number | null {
  const m = String(raw).trim().match(FRACTION_RE);
  if (!m) return null;
  const numer = Number(m[1]);
  const denom = Number(m[2]);
  if (!Number.isFinite(numer) || !Number.isFinite(denom) || denom === 0) return null;
  return numer / denom;
}

const MIXED_NUMBER_RE = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/;

/** Parse a plain decimal/integer, a fraction or a mixed number ("1 5/12") into a number. */
export function parseNumericAnswer(raw: string): number | null {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const mixed = trimmed.match(MIXED_NUMBER_RE);
  if (mixed && Number(mixed[3]) !== 0) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }
  const frac = parseFraction(trimmed);
  if (frac !== null) return frac;
  if (!PLAIN_NUMBER_RE.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** True when the canonical answer looks like a fraction (e.g. "5/6"). */
export function answerLooksLikeFraction(answer: string): boolean {
  return parseFraction(answer) !== null;
}

/**
 * True when the number/fill input should be a text field (not HTML number),
 * so learners can type "5/6". Also when the prompt asks for a fraction answer.
 */
export function shouldUseTextNumericInput(q: QuizQuestion): boolean {
  if (q.type === "fill") return true;
  if (q.type !== "number") return false;
  if (answerLooksLikeFraction(q.answer)) return true;
  if (!PLAIN_NUMBER_RE.test(String(q.answer).trim())) return true;
  const prompt = `${q.prompt.zh ?? ""} ${q.prompt.en ?? ""}`;
  // Prompt asks for the fraction itself (not "numerator of…", which stays numeric).
  if (
    /(最簡分數|simplest\s+form|lowest\s+terms|寫成分數|as a fraction|in lowest terms)/i.test(
      prompt,
    ) &&
    !/(分子|分母|numerator|denominator)/i.test(prompt)
  ) {
    return true;
  }
  if (/(分數|fraction)/i.test(prompt) && /(作答|answer|寫出|write)/i.test(prompt)) {
    return true;
  }
  return false;
}

/** Collapse spaces around "/" so "5 / 6" normalises like "5/6". */
export function normalizeFractionSpacing(input: string): string {
  return input.replace(/\s*\/\s*/g, "/");
}

/**
 * Compare a learner answer to an expected value.
 * - If both parse as numbers/fractions, compare by numeric value (tolerance).
 * - Otherwise compare normalised strings (with fraction spacing collapsed).
 */
export function answersEqual(
  given: string | number | null | undefined,
  expected: string | number,
  tolerance = 0.011,
): boolean {
  if (given === null || given === undefined || given === "") return false;
  const givenStr = String(given).trim();
  const expectedStr = String(expected).trim();
  if (!givenStr || !expectedStr) return false;

  const givenNum = parseNumericAnswer(givenStr);
  const expectedNum = parseNumericAnswer(expectedStr);
  if (givenNum !== null && expectedNum !== null) {
    return Math.abs(givenNum - expectedNum) <= tolerance;
  }

  const a = normalizeAnswer(normalizeFractionSpacing(givenStr));
  const b = normalizeAnswer(normalizeFractionSpacing(expectedStr));
  return a === b;
}

/**
 * Lenient key for typed (fill) answers: full/half-width folded (NFKC), case,
 * punctuation and all whitespace ignored.
 */
export function lenientKey(input: string): string {
  return normalizeAnswer(normalizeFractionSpacing(String(input).normalize("NFKC"))).replace(/\s+/g, "");
}

/** "一首" → "首": drop a leading count word in front of a single measure word. */
function withoutCountWord(key: string): string {
  const m = key.match(/^(?:一|1)([\u3400-\u9FFF])$/);
  return m ? m[1] : key;
}

/** Fill marking: exact/numeric match, or equal after lenient normalisation (with or without 一). */
export function fillAnswersEqual(given: string, expected: string): boolean {
  if (answersEqual(given, expected)) return true;
  const a = lenientKey(given);
  const b = lenientKey(expected);
  if (!a || !b) return false;
  return a === b || withoutCountWord(a) === withoutCountWord(b);
}

/** Recorded answer for a match item: "<first-try pairs>/<total pairs>". */
export function matchGiven(firstTry: number, total: number): string {
  return `${firstTry}/${total}`;
}

/** Whether a quiz answer (including optional accepts) matches the given value. */
export function isQuizAnswerRight(
  q: QuizQuestion,
  val: string | number | null | undefined,
): boolean {
  if (val === null || val === undefined || val === "") return false;
  if (q.type === "match") {
    // Whole item is right only when every pair was matched on the first try.
    const n = q.pairs?.length ?? 0;
    return n > 0 && String(val) === matchGiven(n, n);
  }
  const candidates = [q.answer, ...(q.accepts ?? [])];
  if (q.type === "fill") {
    return candidates.some((accepted) => fillAnswersEqual(String(val), accepted));
  }
  return candidates.some((accepted) => answersEqual(val, accepted));
}
