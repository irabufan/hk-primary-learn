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
export function answerTypeGuidance(year: Year, subject: SubjectSlug, seed = 0): string {
  // The model defaults to 4 pairs; ask for 5 on even seeds so both sizes appear.
  const pairCount = seed % 2 === 0 ? 5 : 4;
  const matchIdeas =
    subject === "chinese"
      ? "量詞↔名詞, 詞語↔意思, 近義詞/反義詞"
      : subject === "english"
        ? "English word ↔ 中文意思, word ↔ picture-word category, opposite ↔ opposite"
        : subject === "maths"
          ? "number ↔ 中文數字 / number word, sum ↔ result, shape ↔ number of sides, time ↔ words"
          : "動物↔居所, 物品↔用途, 職業↔工作地點, 食物↔食物類別";
  const matchShape =
    `A "match" item has a short instruction prompt and "pairs": exactly ${pairCount} {"left","right"} objects; every left and every right must be unique, pairs must be mutually exclusive: each right is correct for exactly one left and wrong for every other left (BAD: "ball games→football" with "racket sports→tennis", because tennis is also a ball game; avoid overlapping category labels), each side ≤ 8 字 / 3 English words. Leave out "answer" and "choices" for match.`;
  const fillShape =
    '- Every fill answer is one word or a short term: at most 6 Chinese characters or 3 English words (numbers/fractions are fine). If the answer would be a phrase or sentence, write the item as mc instead.';
  const passageRule =
    '- An item that refers to a passage/短文/文中 MUST include that passage in its own "passage" field.';
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
      passageRule,
    ].join("\n");
  }
  if (year === "P3") {
    return [
      "ANSWER TYPES (P3 — CRITICAL):",
      '- Mostly type "mc".',
      '- At most 2 items of type "fill", only for short answers (one word / 1–4 字). For each fill: list every acceptable alternate in "accepts" (with and without the count word, e.g. "一座小屋" and "小屋"; synonyms; traditional variants), and also give "choices": the answer plus 3 plausible wrong options.',
      subject === "maths" ? '- type "number" is fine for numeric answers.' : '- Do NOT use type "number".',
      `- Include 1–2 match items when the topic suits pairing (e.g. ${matchIdeas}).`,
      `- ${matchShape}`,
      fillShape,
      passageRule,
    ].join("\n");
  }
  return [
    `ANSWER TYPES (${year}):`,
    '- Use mc, fill and number as they fit the topic.',
    `- At most 1 match item, only when the topic naturally suits pairing (e.g. ${matchIdeas}); 0 is fine.`,
    `- ${matchShape}`,
    fillShape,
    '- For each fill, list every acceptable alternate in "accepts" (with and without the count word, e.g. "一座小屋" and "小屋"; synonyms; British/American spellings), and also give "choices": the answer plus 3 plausible wrong options (used if the item must become mc).',
    passageRule,
  ].join("\n");
}

export const FILL_MAX_CJK = 6;
export const FILL_MAX_WORDS = 3;

/** Fill answers must be one word / a short term: ≤ 6 漢字 or ≤ 3 English words (numbers always OK). */
export function isShortFillAnswer(answer: string): boolean {
  const a = answer.trim();
  if (!a) return false;
  if (parseNumericAnswer(a) !== null) return true;
  const cjk = (a.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g) ?? []).length;
  if (cjk > FILL_MAX_CJK) return false;
  const words = a.replace(/[\u3400-\u9FFF\uF900-\uFAFF]/g, " ").split(/[\s/]+/).filter((w) => /[A-Za-z]/.test(w));
  return words.length <= FILL_MAX_WORDS && a.length <= 30;
}

const PASSAGE_REF_ZH = /(短文|文章|根據文|文中|上文|故事中|閱讀(以下|下面))/;
const PASSAGE_REF_EN = /\b(the passage|the text|the story|the article)\b/i;

/** True when the item points at a passage/短文 but has none attached. */
export function refersToMissingPassage(q: QuizQuestion): boolean {
  if (q.passage?.zh?.trim() || q.passage?.en?.trim()) return false;
  const text = `${q.prompt.zh ?? ""} ${q.prompt.en ?? ""}`;
  return PASSAGE_REF_ZH.test(text) || PASSAGE_REF_EN.test(text);
}

const COMPARE_MAX = /(最大|較大|大得多|largest|greatest|biggest|larger|greater)/i;
const COMPARE_MIN = /(最小|較小|smallest|least|smaller)/i;
/** Prompts where 最大/最小 is part of a computed answer (HCF, minimum count …), not a comparison. */
const COMPARE_SKIP = /(因數|倍數|多少|幾多|計算|factor|multiple|how many|how much|at least|at most)/i;

/**
 * For "which is largest/smallest" mc items whose choices are all numbers/fractions,
 * verify the key by value. Returns false when the keyed answer is not the unique max/min.
 */
export function numericComparisonKeyOk(q: QuizQuestion): boolean {
  if (q.type !== "mc" || !q.choices?.length) return true;
  const text = `${q.prompt.zh ?? ""} ${q.prompt.en ?? ""}`;
  const wantMax = COMPARE_MAX.test(text);
  const wantMin = COMPARE_MIN.test(text);
  if (wantMax === wantMin || COMPARE_SKIP.test(text)) return true;
  const values = q.choices.map((c) => parseNumericAnswer(c));
  if (values.some((v) => v === null)) return true;
  const nums = values as number[];
  const target = wantMax ? Math.max(...nums) : Math.min(...nums);
  const key = parseNumericAnswer(q.answer);
  return key !== null && Math.abs(key - target) < 1e-9 && nums.filter((v) => Math.abs(v - target) < 1e-9).length === 1;
}


/** Strip cm² / 平方厘米-style units so "24 cm²" parses as 24. */
/**
 * True when a Chinese maths stem asks "多了幾／少了幾" without naming the
 * comparison subject with 比 — kids can read it as a total or a difference.
 * Low false-positive: requires 多/少…了幾 and absence of 比.
 */
export function ambiguousFractionCompareStem(promptZh: string | undefined): boolean {
  const zh = (promptZh ?? "").replace(/\s+/g, "");
  if (!zh) return false;
  if (/比/.test(zh)) return false;
  // 「多讀了幾分之幾」「多了幾」 without 比 — not 「比…多了幾」.
  return /多(?:讀|做|用|吃|走|買|喝|寫|花)?了(?:幾|多少)/.test(zh) || /少(?:讀|做|用|吃|走|買|喝|寫|花)?了(?:幾|多少)/.test(zh);
}

export function stripAreaUnit(raw: string): string {
  return String(raw)
    .trim()
    .replace(/\s*(cm\s*[²2]|m\s*[²2]|平方厘米|平方公分|平方米|sq\.?\s*c?m)\s*$/i, "")
    .trim();
}

/**
 * Cheap area-key check. When the stem clearly states a single parallelogram /
 * triangle / trapezium / rectangle (or a two-part composite) with numbers, verify
 * the keyed answer equals the formula. Unverifiable stems pass (return true).
 */
export function areaArithmeticKeyOk(q: QuizQuestion, topic?: string): boolean {
  const prompt = `${q.prompt.zh ?? ""} ${q.prompt.en ?? ""}`;
  const isAreaTopic = topic === "area" || topic === "area-polygons";
  const mentionsArea = /面積|area\b/i.test(prompt);
  if (!isAreaTopic && !mentionsArea) return true;
  if (q.type === "match") return true;

  const keyNum = parseNumericAnswer(stripAreaUnit(q.answer));
  if (keyNum === null || !(keyNum > 0)) {
    // Area topics need a positive numeric key; other topics with a soft "面積" mention pass.
    return !isAreaTopic;
  }

  const expected = expectedAreaFromPrompt(prompt);
  if (expected === null) return true; // cannot verify cheaply
  return Math.abs(expected - keyNum) <= 0.011;
}

/** Pull a verifiable area from a worded stem, or null if ambiguous. */
function expectedAreaFromPrompt(prompt: string): number | null {
  const text = prompt.replace(/,/g, "");
  const parts: number[] = [];
  const shapeRe =
    /平行四邊形|三角形|梯形|長方形|矩形|正方形|parallelogram|triangle|trapez(?:ium|oid)?|rectangle|square/gi;
  for (const sm of text.matchAll(shapeRe)) {
    const name = sm[0];
    const at = sm.index ?? 0;
    const area = areaForShapeAt(name, text, at);
    if (area !== null) parts.push(area);
  }

  const uniq: number[] = [];
  for (const p of parts) {
    if (!uniq.some((u) => Math.abs(u - p) < 1e-9)) uniq.push(p);
  }
  if (uniq.length === 0) return null;
  if (uniq.length === 1) return uniq[0];
  if (/減去|挖去|剪去|subtract|minus|cut (?:out|from)|hole/i.test(text)) {
    return Math.abs(uniq[0] - uniq.slice(1).reduce((a, b) => a + b, 0));
  }
  if (/分割|拼成|組成|合共|總面積|composite|split|join|made of|together|joined/i.test(text)) {
    return uniq.reduce((a, b) => a + b, 0);
  }
  return null;
}

/** Dimensions immediately before ("底 8…的三角形") or after ("三角形的底是 8…") the shape name. */
function areaForShapeAt(name: string, text: string, at: number): number | null {
  const before = text.slice(Math.max(0, at - 32), at);
  const after = text.slice(at, Math.min(text.length, at + name.length + 32));
  const lower = name.toLowerCase();

  if (/梯形|trapez/.test(lower)) {
    const m =
      before.match(/上底\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,18}?下底\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,18}?高\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)\s*(?:厘米|cm)?(?:的?(?:直角|等腰|等邊)?)?$/) ||
      after.match(/上底\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,18}?下底\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,18}?高\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)/);
    if (m) return ((Number(m[1]) + Number(m[2])) * Number(m[3])) / 2;
    return null;
  }
  if (/長方形|矩形|rectangle/.test(lower)) {
    const m =
      before.match(/長\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,14}?(?:闊|寬)\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)\s*(?:厘米|cm)?(?:的?(?:直角|等腰|等邊)?)?$/) ||
      after.match(/長\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,14}?(?:闊|寬)\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)/) ||
      after.match(/(\d+(?:\.\d+)?)\s*cm\s*(?:by|×|x)\s*(\d+(?:\.\d+)?)/i);
    if (m) return Number(m[1]) * Number(m[2]);
    return null;
  }
  if (/正方形|square/.test(lower)) {
    const m =
      before.match(/邊長\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)\s*(?:厘米|cm)?(?:的?(?:直角|等腰|等邊)?)?$/) ||
      after.match(/邊長\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)|side\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const s = Number(m[1] || m[2]);
      return s * s;
    }
    return null;
  }

  // Prefer trailing "底…高…的SHAPE"; else "SHAPE…底…高".
  const bhBefore = before.match(/(?:底|base)\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,14}?(?:高|height)\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)\s*(?:厘米|cm)?(?:的?(?:直角|等腰|等邊)?)?$/i);
  const bhAfter = after.match(/(?:底|base)\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)[\s\S]{0,14}?(?:高|height)\s*(?:是|為|:|：)?\s*(\d+(?:\.\d+)?)/i);
  const bh = bhBefore || bhAfter;
  if (!bh) return null;
  const product = Number(bh[1]) * Number(bh[2]);
  if (/三角形|triangle/.test(lower)) return product / 2;
  if (/平行四邊形|parallelogram/.test(lower)) return product;
  return null;
}

/**
 * Key for "are these two mc choices the same option?". Only formatting is folded
 * (width, case, spacing, trailing full stop); apostrophes and hyphens are kept,
 * because they make different answers in grammar items: cat / cats / cat's / cats'.
 * (lenientKey strips them — right for marking typed answers, wrong here.)
 */
function choiceKey(choice: string): string {
  const n = parseNumericAnswer(choice);
  if (n !== null) return `#${n}`;
  return choice
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[\s.。!！?？]+$/u, "")
    .trim();
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
/** Category-style labels that tend to overlap (tennis is a ball game AND a racket sport). */
const OVERLAP_PRONE_EN = /\b(games?|sports?|activit(y|ies)|things|stuff)$/i;
const OVERLAP_PRONE_ZH = /(運動|遊戲|活動|東西|用品)$/;

/**
 * Heuristic check that pairs are mutually exclusive: a side with two or more
 * overlap-prone category labels ("ball games" + "racket sports") is flagged,
 * since one right can then fit several lefts. The prompt rule does the rest.
 */
export function matchPairsAmbiguous(pairs: QuizMatchPair[]): boolean {
  return (["left", "right"] as const).some(
    (side) => pairs.filter((p) => OVERLAP_PRONE_EN.test(p[side].trim()) || OVERLAP_PRONE_ZH.test(p[side].trim())).length >= 2,
  );
}

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
  return out.length >= MATCH_MIN_PAIRS && !matchPairsAmbiguous(out) ? out : null;
}

export function matchAnswerKey(pairs: QuizMatchPair[]): string {
  return pairs.map((p) => `${p.left} → ${p.right}`).join("; ");
}

/**
 * Apply the year's answer-type rules. Order is kept; invalid items are repaired
 * (→ mc) or dropped, so the result may be shorter than the input.
 */
export type RuleStats = {
  toMc: number;
  repairedMc: number;
  dropped: number;
  droppedTypes?: string[];
  /** One entry per drop: which rule, and a short view of the item (for logs). */
  drops?: { reason: string; item: string }[];
};

/** Short one-line view of an item for drop logs (no secrets, ≤ 160 chars). */
function itemSummary(q: QuizQuestion): string {
  const stem = (q.prompt.en || q.prompt.zh || "").slice(0, 60);
  const extra = q.type === "match" ? (q.pairs ?? []).map((p) => `${p.left}→${p.right}`).join(";") : `ans=${q.answer} ch=${(q.choices ?? []).join("/")}`;
  return `${q.type} "${stem}" ${extra}`.slice(0, 160);
}

export function enforceAnswerTypes(
  questions: QuizQuestion[],
  opts: { year: Year; subject: SubjectSlug; seed: number },
  stats: RuleStats = { toMc: 0, repairedMc: 0, dropped: 0 },
): QuizQuestion[] {
  const policy = gradePolicy(opts.year);
  const drop = (q: QuizQuestion, reason: string) => {
    stats.dropped += 1;
    (stats.droppedTypes ??= []).push(q.type);
    (stats.drops ??= []).push({ reason, item: itemSummary(q) });
  };
  let fills = 0;
  let matches = 0;
  const out: QuizQuestion[] = [];

  questions.forEach((q, i) => {
    const rng = mulberry32((opts.seed >>> 0) + Math.imul(i + 1, 9973));

    if (refersToMissingPassage(q)) {
      drop(q, "missing-passage");
      return;
    }
    /** mc result must also pass the numeric "largest/smallest" key check. */
    const pushMc = (mc: QuizQuestion, converted: boolean) => {
      if (!numericComparisonKeyOk(mc)) {
        drop(q, "numeric-compare-key");
        return;
      }
      if (converted) stats.toMc += 1;
      out.push(mc);
    };

    if (q.type === "match") {
      const pairs = cleanMatchPairs(q.pairs);
      if (!pairs || matches >= policy.maxMatch) {
        drop(q, !pairs ? "match-invalid" : "match-cap");
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
      if (!fixed) drop(q, "mc-not-4-distinct");
      else {
        const before = q.choices ?? [];
        const changed = before.length !== MC_CHOICES || !before.includes(fixed.answer) ||
          fixed.choices!.some((c) => !before.includes(c));
        if (changed) stats.repairedMc += 1;
        pushMc(fixed, false);
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
      if (asMc) pushMc(asMc, true);
      else drop(q, "number-not-allowed");
      return;
    }

    // fill: keep only short answers, within the year's cap; otherwise → mc or drop.
    if (fills < policy.maxFill && isShortFillAnswer(q.answer)) {
      fills += 1;
      const next = { ...q };
      delete next.choices;
      out.push(next);
      return;
    }
    const asMc = repairMc(q, rng);
    if (asMc) pushMc(asMc, true);
    else drop(q, fills >= policy.maxFill ? "fill-cap" : "fill-too-long");
  });

  return out;
}
