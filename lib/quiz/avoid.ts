/**
 * Repeat avoidance across quizzes. Client: a rolling per-topic history of stem
 * fingerprints in localStorage, sent as avoidPrompts on every generate.
 * Server: drop generated items that closely match a fingerprint.
 * Pure helpers only — safe to import from client and server code.
 */
import type { Quiz, QuizQuestion } from "./types";

/** Fingerprints kept per subject/topic/year, and the most the server reads. */
export const AVOID_MAX = 40;
/** Max length of one fingerprint (stem + short answer). */
export const AVOID_STEM_MAX = 160;
/** Answers up to this length ride along as " → answer". */
const ANSWER_MAX = 30;
const ANSWER_SEP = " → ";
/** Same answer and stem bigram Jaccard at least this → near repeat. */
const NEAR_SIM = 0.6;
/** Fingerprint without an answer (long answer / old client): stem alone must be this close. */
const NEAR_SIM_NO_ANSWER = 0.8;

function stemText(q: Pick<QuizQuestion, "prompt">): string {
  const parts = [q.prompt.zh, q.prompt.en].map((s) => s?.trim()).filter((s): s is string => Boolean(s));
  return [...new Set(parts)].join(" / ");
}

/** "zh / en → answer" (answer only when short and not a match item), ≤ AVOID_STEM_MAX chars. */
export function questionFingerprint(q: QuizQuestion): string {
  const stem = stemText(q);
  const answer = q.answer?.trim() ?? "";
  if (q.type !== "match" && answer && answer.length <= ANSWER_MAX) {
    return `${stem.slice(0, AVOID_STEM_MAX - answer.length - ANSWER_SEP.length)}${ANSWER_SEP}${answer}`;
  }
  return stem.slice(0, AVOID_STEM_MAX);
}

export function quizFingerprints(quiz: Quiz): string[] {
  return quiz.questions.map(questionFingerprint).filter(Boolean);
}

/** Lowercase, NFKC, letters and digits only (drops spaces, punctuation, blanks). */
export function normalizeForSimilarity(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

function normalizeAnswer(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(/\s+/g, "").replace(/[。.!?！？]+$/u, "");
}

function bigrams(s: string): Set<string> {
  if (s.length < 2) return new Set(s ? [s] : []);
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

/** Character-bigram Jaccard similarity of two normalized strings. */
export function bigramJaccard(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  if (!A.size && !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter += 1;
  return inter / (A.size + B.size - inter);
}

export type AvoidKey = { stem: string; grams: Set<string>; answer?: string };

export function parseAvoidKeys(avoid: readonly string[] | undefined): AvoidKey[] {
  return (avoid ?? []).flatMap((raw) => {
    const at = raw.lastIndexOf(ANSWER_SEP);
    const stem = normalizeForSimilarity(at >= 0 ? raw.slice(0, at) : raw);
    const answer = at >= 0 ? normalizeAnswer(raw.slice(at + ANSWER_SEP.length)) : undefined;
    return stem ? [{ stem, grams: bigrams(stem), ...(answer ? { answer } : {}) }] : [];
  });
}

/** True when the item closely matches a fingerprint (match items are never dropped here). */
export function matchesAvoid(q: QuizQuestion, keys: readonly AvoidKey[]): boolean {
  if (!keys.length || q.type === "match") return false;
  // Compare the same truncated stem the fingerprint holds.
  const stem = normalizeForSimilarity(stemText(q).slice(0, AVOID_STEM_MAX));
  if (!stem) return false;
  const answer = normalizeAnswer(q.answer ?? "");
  const grams = bigrams(stem);
  return keys.some((k) => {
    const limit = k.answer === undefined ? NEAR_SIM_NO_ANSWER : k.answer === answer ? NEAR_SIM : 2;
    if (limit > 1) return false;
    let inter = 0;
    for (const g of grams) if (k.grams.has(g)) inter += 1;
    return inter / (grams.size + k.grams.size - inter) >= limit;
  });
}

/* ---- client history (localStorage) ---- */

const HISTORY_PREFIX = "hklearn-quiz-seen:";

function historyKey(subject: string, topic: string, year: string): string {
  return `${HISTORY_PREFIX}${subject}/${topic}/${year}`;
}

/** Newest first, at most AVOID_MAX. */
export function readQuizHistory(subject: string, topic: string, year: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(historyKey(subject, topic, year)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string").slice(0, AVOID_MAX) : [];
  } catch {
    return [];
  }
}

export function rememberQuiz(quiz: Quiz): void {
  if (typeof window === "undefined") return;
  const fresh = quizFingerprints(quiz);
  const old = readQuizHistory(quiz.subject, quiz.topic, quiz.year).filter((s) => !fresh.includes(s));
  try {
    window.localStorage.setItem(
      historyKey(quiz.subject, quiz.topic, quiz.year),
      JSON.stringify([...fresh.reverse(), ...old].slice(0, AVOID_MAX)),
    );
  } catch {
    /* storage full / disabled — history is best effort */
  }
}
