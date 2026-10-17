import type { Year } from "@/lib/curriculum";
import { formatNumber } from "@/lib/i18n/types";
import { chineseBank } from "@/lib/exercises/chinese";
import { getBank } from "@/lib/exercises";
import type { FillItem, MatchPair, McItem, NumberItem } from "@/lib/exercises/types";
import { suitsYear } from "@/lib/exercises/types";
import { mulberry32, pickInt, pickOne, shuffle, type Rng } from "@/lib/rng";
import type { Quiz, QuizGenerator, QuizQuestion, QuizRequest } from "./types";
import { QUIZ_COUNTS } from "./types";

/**
 * Mock quiz generator: builds quizzes from the exercise banks plus seeded
 * parameterised maths templates. Same seed → same quiz; new seed → new quiz.
 */

// Small delay so the async loading state is real (and mirrors future LLM latency).
const ARTIFICIAL_DELAY_MS = 400;

export class MockQuizGenerator implements QuizGenerator {
  async generate(request: QuizRequest): Promise<Quiz> {
    await new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS));
    const rng = mulberry32(request.seed);
    const questions = buildQuestions(request, rng);
    return {
      id: `quiz-${request.subject}-${request.topic}-${request.year}-${request.seed}`,
      subject: request.subject,
      topic: request.topic,
      year: request.year,
      questions,
      seed: request.seed,
    };
  }
}

/** Convenience wrapper — generate a quiz through the current generator. */
export async function generateQuiz(request: QuizRequest): Promise<Quiz> {
  const generator = new MockQuizGenerator();
  return generator.generate(request);
}

// ---------------------------------------------------------------------------
// Bank helpers
// ---------------------------------------------------------------------------

type YearTagged = { years?: Year[] };

/** Year-suited items first, then the rest; cycles if the bank is short. */
function pickYearItems<T extends YearTagged>(rng: Rng, items: readonly T[], count: number, year: Year): T[] {
  if (items.length === 0) return [];
  const preferred = shuffle(rng, items.filter((item) => suitsYear(item, year)));
  const others = shuffle(rng, items.filter((item) => !suitsYear(item, year)));
  const pool = [...preferred, ...others];
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(pool[i % pool.length]);
  return out;
}

function toMcQuestion(item: McItem, index: number, rng: Rng): QuizQuestion {
  return {
    id: `${item.id}-q${index + 1}`,
    type: "mc",
    prompt: item.prompt,
    passage: item.passage,
    choices: shuffle(rng, item.choices),
    answer: item.choices[item.answerIndex],
    explanation: item.explanation,
  };
}

function toFillQuestion(item: FillItem, index: number): QuizQuestion {
  return {
    id: `${item.id}-q${index + 1}`,
    type: "fill",
    prompt: item.prompt,
    passage: item.passage,
    answer: item.accept[0],
    accepts: item.accept,
    hint: item.hint,
    explanation: item.explanation,
  };
}

function toNumberQuestion(item: NumberItem, index: number): QuizQuestion {
  return {
    id: `${item.id}-q${index + 1}`,
    type: "number",
    prompt: item.prompt,
    answer: formatNumber(item.answer),
    explanation: item.explanation,
  };
}

/** Fallback for any subject/topic combo with a bank but no bespoke strategy. */
function genericBankQuestions(rng: Rng, request: QuizRequest): QuizQuestion[] {
  const bank = (getBank(request.subject, request.topic) ?? []).filter((item) => item.kind !== "match");
  return pickYearItems(rng, bank, request.count, request.year).map((item, index) => {
    if (item.kind === "mc") return toMcQuestion(item, index, rng);
    if (item.kind === "fill") return toFillQuestion(item, index);
    return toNumberQuestion(item, index);
  });
}

// ---------------------------------------------------------------------------
// Chinese topics
// ---------------------------------------------------------------------------

const chineseVocabPairs: MatchPair[] =
  chineseBank.vocab.find((item) => item.kind === "match")?.pairs ?? [];

function vocabQuestions(rng: Rng, request: QuizRequest): QuizQuestion[] {
  if (chineseVocabPairs.length === 0) return genericBankQuestions(rng, request);
  return pickYearItems(rng, chineseVocabPairs, request.count, request.year).map((pair, index) => {
    const distractors = shuffle(
      rng,
      chineseVocabPairs.filter((other) => other.id !== pair.id),
    )
      .slice(0, 3)
      .map((other) => other.right);
    const choices = shuffle(rng, [pair.right, ...distractors]);
    return {
      id: `${pair.id}-q${index + 1}`,
      type: "mc" as const,
      prompt: {
        zh: `「${pair.left}」是甚麼意思？選出正確的解釋。`,
        en: `Which meaning matches “${pair.left}”?`,
      },
      choices,
      answer: pair.right,
      explanation: {
        zh: `「${pair.left}」的意思是「${pair.right}」。`,
        en: `“${pair.left}” means “${pair.right}”.`,
      },
    };
  });
}

function fillBankQuestions(rng: Rng, request: QuizRequest): QuizQuestion[] {
  const bank = (getBank(request.subject, request.topic) ?? []).filter(
    (item): item is FillItem => item.kind === "fill",
  );
  return pickYearItems(rng, bank, request.count, request.year).map(toFillQuestion);
}

// ---------------------------------------------------------------------------
// English topics
// ---------------------------------------------------------------------------

function mcBankQuestions(rng: Rng, request: QuizRequest): QuizQuestion[] {
  const bank = (getBank(request.subject, request.topic) ?? []).filter(
    (item): item is McItem => item.kind === "mc",
  );
  return pickYearItems(rng, bank, request.count, request.year).map((item, index) =>
    toMcQuestion(item, index, rng),
  );
}

// ---------------------------------------------------------------------------
// Maths — parameterised templates (infinite seeded variety)
// ---------------------------------------------------------------------------

const FRACTION_LEVELS: Record<Year, { denoms: number[]; maxTotal: number }> = {
  P4: { denoms: [2, 3, 4], maxTotal: 24 },
  P5: { denoms: [2, 3, 4, 5, 6], maxTotal: 60 },
  P6: { denoms: [2, 3, 4, 5, 6, 8, 10], maxTotal: 100 },
};

/** Fractions with exact terminating decimals. */
const EASY_FRACTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
  [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10],
  [1, 20], [3, 20], [7, 20], [1, 25],
];

/** Coprime pairs used to build "simplify this fraction" questions. */
const COPRIME_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5],
  [4, 5], [5, 6], [1, 6], [5, 8],
];

function fractionQuestion(rng: Rng, year: Year, index: number): QuizQuestion {
  const level = FRACTION_LEVELS[year];
  const variant = index % 4;

  if (variant === 0) {
    // a/b of a total
    const denom = pickOne(rng, level.denoms) ?? 2;
    const numer = pickInt(rng, 1, denom - 1);
    const total = denom * pickInt(rng, 2, Math.floor(level.maxTotal / denom));
    const answer = numer * (total / denom);
    return {
      id: `fx-of-${index + 1}`,
      type: "number",
      prompt: { zh: `${total} 的 ${numer}/${denom} 是多少？`, en: `What is ${numer}/${denom} of ${total}?` },
      answer: formatNumber(answer),
      explanation: {
        zh: `先除後乘：${total} ÷ ${denom} = ${total / denom}，再 × ${numer} = ${formatNumber(answer)}。`,
        en: `Divide first, then multiply: ${total} ÷ ${denom} = ${total / denom}, then × ${numer} = ${formatNumber(answer)}.`,
      },
    };
  }

  if (variant === 1) {
    // fraction → decimal
    const [numer, denom] = pickOne(rng, EASY_FRACTIONS) ?? [1, 2];
    const answer = numer / denom;
    return {
      id: `fx-dec-${index + 1}`,
      type: "number",
      prompt: { zh: `把 ${numer}/${denom} 化為小數。`, en: `Write ${numer}/${denom} as a decimal.` },
      answer: formatNumber(answer),
      explanation: {
        zh: `分子除以分母：${numer} ÷ ${denom} = ${formatNumber(answer)}。`,
        en: `Divide the numerator by the denominator: ${numer} ÷ ${denom} = ${formatNumber(answer)}.`,
      },
    };
  }

  if (variant === 2) {
    // simplify to lowest terms — answer is the full fraction string (e.g. "5/6")
    const [x, y] = pickOne(rng, COPRIME_PAIRS) ?? [1, 2];
    const g = pickInt(rng, 2, 4);
    const numer = g * x;
    const denom = g * y;
    const answer = `${x}/${y}`;
    return {
      id: `fx-simp-${index + 1}`,
      type: "fill",
      prompt: {
        zh: `把 ${numer}/${denom} 約至最簡分數。`,
        en: `Simplify ${numer}/${denom} to lowest terms.`,
      },
      answer,
      accepts: [answer, `${x} / ${y}`],
      explanation: {
        zh: `分子分母同時除以 ${g}，得 ${x}/${y}。`,
        en: `Divide the top and bottom by ${g} to get ${x}/${y}.`,
      },
    };
  }

  // fraction + fraction as a decimal
  let first = pickOne(rng, EASY_FRACTIONS) ?? [1, 2];
  let second = pickOne(rng, EASY_FRACTIONS) ?? [1, 4];
  if (first[1] === second[1]) second = [1, 4];
  if (first[1] === second[1]) first = [1, 2];
  const [a1, d1] = first;
  const [a2, d2] = second;
  const v1 = a1 / d1;
  const v2 = a2 / d2;
  const answer = v1 + v2;
  return {
    id: `fx-add-${index + 1}`,
    type: "number",
    prompt: {
      zh: `${a1}/${d1} + ${a2}/${d2} = ？（以小數作答）`,
      en: `Work out ${a1}/${d1} + ${a2}/${d2}. Give your answer as a decimal.`,
    },
    answer: formatNumber(answer),
    explanation: {
      zh: `${a1}/${d1} = ${formatNumber(v1)}，${a2}/${d2} = ${formatNumber(v2)}，相加得 ${formatNumber(answer)}。`,
      en: `${a1}/${d1} = ${formatNumber(v1)} and ${a2}/${d2} = ${formatNumber(v2)}, so the sum is ${formatNumber(answer)}.`,
    },
  };
}

const DECIMAL_LEVELS: Record<Year, { scale: number; max: number }> = {
  P4: { scale: 10, max: 99 },
  P5: { scale: 10, max: 499 },
  P6: { scale: 100, max: 999 },
};

function decimalQuestion(rng: Rng, year: Year, index: number): QuizQuestion {
  const { scale, max } = DECIMAL_LEVELS[year];
  const variant = index % 4;

  if (variant === 0 || variant === 1) {
    // add / subtract
    const add = variant === 0;
    const aInt = add ? pickInt(rng, 1, max) : pickInt(rng, 2, max);
    const bInt = add ? pickInt(rng, 1, max) : pickInt(rng, 1, aInt - 1);
    const a = aInt / scale;
    const b = bInt / scale;
    const answer = (add ? aInt + bInt : aInt - bInt) / scale;
    const expr = `${formatNumber(a)} ${add ? "+" : "−"} ${formatNumber(b)}`;
    return {
      id: `dx-arith-${index + 1}`,
      type: "number",
      prompt: { zh: `${expr} = ?`, en: `${expr} = ?` },
      answer: formatNumber(answer),
      explanation: add
        ? { zh: `對齊小數點再相加：${expr} = ${formatNumber(answer)}。`, en: `Line up the decimal points, then add: ${expr} = ${formatNumber(answer)}.` }
        : { zh: `對齊小數點再相減：${expr} = ${formatNumber(answer)}。`, en: `Line up the decimal points, then subtract: ${expr} = ${formatNumber(answer)}.` },
    };
  }

  if (variant === 2) {
    // decimal × whole number
    const k = pickInt(rng, 2, 9);
    const aInt = pickInt(rng, 1, Math.floor(max / k));
    const a = aInt / scale;
    const answer = (k * aInt) / scale;
    const expr = `${formatNumber(a)} × ${k}`;
    return {
      id: `dx-mul-${index + 1}`,
      type: "number",
      prompt: { zh: `${expr} = ?`, en: `${expr} = ?` },
      answer: formatNumber(answer),
      explanation: {
        zh: `先乘再點回小數位：${expr} = ${formatNumber(answer)}。`,
        en: `Multiply first, then place the decimal point: ${expr} = ${formatNumber(answer)}.`,
      },
    };
  }

  // decimal ÷ whole number
  const k = pickInt(rng, 2, 9);
  const qInt = pickInt(rng, 1, Math.floor(max / k));
  const dividend = (k * qInt) / scale;
  const answer = qInt / scale;
  const expr = `${formatNumber(dividend)} ÷ ${k}`;
  return {
    id: `dx-div-${index + 1}`,
    type: "number",
    prompt: { zh: `${expr} = ?`, en: `${expr} = ?` },
    answer: formatNumber(answer),
    explanation: {
      zh: `先除再點回小數位：${expr} = ${formatNumber(answer)}。`,
      en: `Divide first, then place the decimal point: ${expr} = ${formatNumber(answer)}.`,
    },
  };
}

/** Four plausible-but-wrong numeric distractors around an answer. */
function numericChoices(rng: Rng, answer: number, candidates: number[]): string[] {
  const seen = new Set<number>([answer]);
  const picks: number[] = [];
  for (const candidate of [...candidates, answer + 1, answer - 1, answer + 2, answer + 3, answer + 5]) {
    if (picks.length >= 3) break;
    if (candidate > 0 && Number.isInteger(candidate) === Number.isInteger(answer) && !seen.has(candidate)) {
      seen.add(candidate);
      picks.push(candidate);
    }
  }
  return shuffle(rng, [answer, ...picks]).map((value) => formatNumber(value));
}

const PRICE_RANGES: Record<Year, [number, number]> = {
  P4: [8, 20],
  P5: [15, 50],
  P6: [20, 90],
};

const EACH_RANGES: Record<Year, [number, number]> = {
  P4: [2, 8],
  P5: [3, 10],
  P6: [4, 12],
};

function wordProblemQuestion(rng: Rng, year: Year, index: number): QuizQuestion {
  const variant = index % 4;

  if (variant === 0) {
    // shopping: unit price × quantity
    const [min, max] = PRICE_RANGES[year];
    const price = pickInt(rng, min, max);
    const quantity = pickInt(rng, 2, 5);
    const answer = price * quantity;
    return {
      id: `wp-shop-${index + 1}`,
      type: "mc",
      prompt: {
        zh: `一本筆記本售 ${price} 元。陳老師買了 ${quantity} 本，共要付多少元？`,
        en: `A notebook costs $${price}. Miss Chan buys ${quantity} of them. How much does she pay altogether?`,
      },
      choices: numericChoices(rng, answer, [price * (quantity + 1), price * (quantity - 1), price + quantity]),
      answer: String(answer),
      explanation: {
        zh: `每本 ${price} 元：${price} × ${quantity} = ${answer}（元）。`,
        en: `$${price} each, ${quantity} notebooks: ${price} × ${quantity} = $${answer}.`,
      },
    };
  }

  if (variant === 1) {
    // sharing: total ÷ friends
    const [min, max] = EACH_RANGES[year];
    const friends = pickInt(rng, 2, 9);
    const each = pickInt(rng, min, max);
    const total = friends * each;
    const answer = each;
    return {
      id: `wp-share-${index + 1}`,
      type: "mc",
      prompt: {
        zh: `媽媽把 ${total} 顆朱古力平均分給 ${friends} 個孩子，每人可得多少顆？`,
        en: `Mum shares ${total} chocolates equally among ${friends} children. How many does each child get?`,
      },
      choices: numericChoices(rng, answer, [each + 1, each - 1, friends]),
      answer: String(answer),
      explanation: {
        zh: `平均分：${total} ÷ ${friends} = ${answer}（顆）。`,
        en: `Share them equally: ${total} ÷ ${friends} = ${answer}.`,
      },
    };
  }

  if (variant === 2) {
    // bus: start − off + on
    const start = pickInt(rng, 30, 60);
    const off = pickInt(rng, 5, 20);
    const on = pickInt(rng, 3, 15);
    const answer = start - off + on;
    return {
      id: `wp-bus-${index + 1}`,
      type: "mc",
      prompt: {
        zh: `巴士上有 ${start} 人。到了下一站，${off} 人下車，${on} 人上車，現在車上有多少人？`,
        en: `There are ${start} people on a bus. At the next stop, ${off} people get off and ${on} people get on. How many people are on the bus now?`,
      },
      choices: numericChoices(rng, answer, [start - off, start + on, start + off - on]),
      answer: String(answer),
      explanation: {
        zh: `${start} − ${off} = ${start - off}，再 + ${on} = ${answer}。`,
        en: `${start} − ${off} = ${start - off}, then + ${on} = ${answer}.`,
      },
    };
  }

  // change: money left after shopping
  const have = pickInt(rng, 4, 20) * 5;
  const price = pickInt(rng, 3, Math.floor(have / 5)) * 5;
  const answer = have - price;
  return {
    id: `wp-change-${index + 1}`,
    type: "mc",
    prompt: {
      zh: `樂樂有 ${have} 元，買了一個 ${price} 元的文具盒，還剩多少元？`,
      en: `Lucas has $${have} and buys a pencil case for $${price}. How much money is left?`,
    },
    choices: numericChoices(rng, answer, [have + price, price, have]),
    answer: String(answer),
    explanation: {
      zh: `${have} − ${price} = ${answer}（元）。`,
      en: `$${have} − $${price} = $${answer}.`,
    },
  };
}

/** Mix parameterised word problems with the authored bank. */
function wordProblemQuestions(rng: Rng, request: QuizRequest): QuizQuestion[] {
  const bank = (getBank("maths", request.topic) ?? []).filter(
    (item): item is McItem => item.kind === "mc",
  );
  const pool = pickYearItems(rng, bank, request.count, request.year);
  const out: QuizQuestion[] = [];
  let bankIndex = 0;
  for (let i = 0; i < request.count; i++) {
    const useParametric = bankIndex >= pool.length || rng() < 0.6;
    if (useParametric) {
      out.push(wordProblemQuestion(rng, request.year, i));
    } else {
      out.push(toMcQuestion(pool[bankIndex], bankIndex, rng));
      bankIndex += 1;
    }
  }
  return out;
}

/** Mix parameterised questions with the authored number bank. */
function numberQuestions(
  parametric: (rng: Rng, year: Year, index: number) => QuizQuestion,
  rng: Rng,
  request: QuizRequest,
): QuizQuestion[] {
  const bank = (getBank(request.subject, request.topic) ?? []).filter(
    (item): item is NumberItem => item.kind === "number",
  );
  const pool = pickYearItems(rng, bank, request.count, request.year);
  const out: QuizQuestion[] = [];
  let bankIndex = 0;
  for (let i = 0; i < request.count; i++) {
    const useParametric = bankIndex >= pool.length || rng() < 0.55;
    if (useParametric) {
      out.push(parametric(rng, request.year, i));
    } else {
      out.push(toNumberQuestion(pool[bankIndex], bankIndex));
      bankIndex += 1;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

type Strategy = (rng: Rng, request: QuizRequest) => QuizQuestion[];

const STRATEGIES: Record<string, Strategy> = {
  "chinese/vocab": vocabQuestions,
  "chinese/reading": fillBankQuestions,
  "chinese/sentences": fillBankQuestions,
  "english/vocabulary": fillBankQuestions,
  "english/reading": mcBankQuestions,
  "english/grammar": mcBankQuestions,
  "maths/fractions": (rng, request) => numberQuestions(fractionQuestion, rng, request),
  "maths/decimals": (rng, request) => numberQuestions(decimalQuestion, rng, request),
  "maths/word-problems": wordProblemQuestions,
};

function normalizeCount(count: number): number {
  return (QUIZ_COUNTS as readonly number[]).includes(count) ? count : QUIZ_COUNTS[0];
}

function buildQuestions(request: QuizRequest, rng: Rng): QuizQuestion[] {
  const strategy = STRATEGIES[`${request.subject}/${request.topic}`];
  const normalised: QuizRequest = { ...request, count: normalizeCount(request.count) };
  return strategy ? strategy(rng, normalised) : genericBankQuestions(rng, normalised);
}
