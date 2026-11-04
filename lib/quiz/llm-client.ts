/**
 * Server-only helpers for OpenAI-compatible chat completions.
 * Never import this from client components.
 *
 * Env (generic preferred; OpenCode Go aliases still work for existing deploys):
 *   LLM_API_KEY   || OPENCODE_GO_API_KEY
 *   LLM_MODEL     || OPENCODE_GO_MODEL     (default: gpt-6-luna;
 *                                           set deepseek-v4.1-flash to revert)
 *   LLM_BASE_URL  || OPENCODE_GO_BASE_URL  (default: OpenCode Go zen endpoint)
 */

import { getTopic, topicsForYear, type SubjectSlug, type Year } from "@/lib/curriculum";
import { curriculumGuidanceBlock, offTopicTerms, topicScope } from "@/lib/curriculum-guidance";
import { retrieveCurriculumContext } from "@/lib/curriculum-retrieve";
import type { Localized } from "@/lib/i18n/types";
import { mulberry32, shuffle } from "@/lib/rng";
import type { Quiz, QuizMatchPair, QuizQuestion, QuizQuestionType, QuizRequest } from "./types";
import { QUIZ_COUNTS } from "./types";
import { applyHkForms } from "./hk-forms";
import { answerTypeGuidance, enforceAnswerTypes, type RuleStats } from "./answer-rules";
import { buildRuledQuestions } from "./generator";
import { AVOID_MAX, AVOID_STEM_MAX, matchesAvoid, parseAvoidKeys } from "./avoid";

const DEFAULT_BASE = "https://opencode.ai/zen/go/v1";
const DEFAULT_MODEL = "gpt-6-luna";
const TIMEOUT_MS = 55_000;
/** Whole-request budget (route maxDuration is 60 s); a retry only runs inside it. */
const TOTAL_BUDGET_MS = 57_000;
/** Don't start a retry with less time than this left. */
const MIN_RETRY_MS = 12_000;
/**
 * Output budget. DeepSeek stays at 4096 (more lets its reasoning run past the
 * time budget). Other models (gpt-6-luna, Claude Haiku) get 8192: Haiku hit
 * 4096 mid-JSON on P6 reading.
 */
function maxTokensFor(model: string): number {
  return /deepseek/i.test(model) ? 4096 : 8192;
}
const USER_AGENT = "hk-primary-learn/0.1";

export function getLlmConfig(): {
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
} {
  return {
    apiKey:
      process.env.LLM_API_KEY?.trim() ||
      process.env.OPENCODE_GO_API_KEY?.trim() ||
      undefined,
    baseUrl: (
      process.env.LLM_BASE_URL?.trim() ||
      process.env.OPENCODE_GO_BASE_URL?.trim() ||
      DEFAULT_BASE
    ).replace(/\/$/, ""),
    model:
      process.env.LLM_MODEL?.trim() ||
      process.env.OPENCODE_GO_MODEL?.trim() ||
      DEFAULT_MODEL,
  };
}

/** True when the configured base URL looks like OpenCode (needs x-opencode-session). */
function isOpenCodeBaseUrl(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host === "opencode.ai" || host.endsWith(".opencode.ai");
  } catch {
    return /opencode\.ai/i.test(baseUrl);
  }
}

const TOPIC_LABELS: Record<string, { zh: string; en: string }> = {
  "chinese/vocab": { zh: "詞語", en: "Vocabulary" },
  "chinese/reading": { zh: "閱讀理解", en: "Reading comprehension" },
  "chinese/sentences": { zh: "病句與造句", en: "Sentence correction" },
  "english/vocabulary": { zh: "英文詞彙", en: "English vocabulary" },
  "english/reading": { zh: "英文閱讀", en: "English reading" },
  "english/grammar": { zh: "文法", en: "Grammar" },
  "maths/numbers": { zh: "數的認識", en: "Numbers (counting, place value, comparing)" },
  "maths/add-subtract": { zh: "加與減", en: "Addition and subtraction" },
  "maths/multiply-divide": { zh: "乘與除", en: "Multiplication and division" },
  "maths/money-time": { zh: "錢幣、時間與量度", en: "Money, time and measures" },
  "maths/shapes": { zh: "圖形與方向", en: "Shapes, position and direction" },
  "maths/fractions": { zh: "分數", en: "Fractions" },
  "maths/decimals": { zh: "小數", en: "Decimals" },
  "maths/percentages": { zh: "百分數", en: "Percentages" },
  "maths/word-problems": { zh: "應用題", en: "Word problems" },
  "gs/healthy-living": { zh: "健康生活", en: "Healthy living" },
  "gs/community": { zh: "社區與生活", en: "Community" },
  "gs/nature-science": { zh: "自然與科學", en: "Nature & science" },
};

function topicLabel(subject: SubjectSlug, topic: string): { zh: string; en: string } {
  return TOPIC_LABELS[`${subject}/${topic}`] ?? { zh: topic, en: topic };
}

/**
 * Strict topic scope: what this topic covers for the year, and the subject's other
 * topics, which the year-wide curriculum lines also mention but this quiz must not test.
 */
function topicScopeBlock(request: QuizRequest): string {
  const label = topicLabel(request.subject, request.topic);
  const topic = getTopic(request.subject, request.topic);
  const scope =
    topicScope(request.year, request.subject, request.topic) ??
    (topic ? `${topic.blurb.zh} / ${topic.blurb.en}` : undefined);
  // Name the other topics with their units for this year, so "not this quiz" is concrete.
  const others = topicsForYear(request.subject, request.year)
    .filter((t) => t.slug !== request.topic)
    .map((t) => {
      const units = topicScope(request.year, request.subject, t.slug);
      return `${t.name.zh} ${t.name.en}${units ? ` (${units})` : ""}`;
    });
  const lines = [`TOPIC (strict): every item must TEST ${label.zh} / ${label.en}${scope ? ` — in scope: ${scope}` : ""}.`];
  if (others.length) {
    lines.push(
      `Not this quiz: the other ${request.subject} topics — ${others.join("; ")}. Do not write items on them, even when curriculum lines below mention them. A ${label.zh} setting does not make an item on-topic (e.g. an energy or friction question set in a clinic or community centre is still science). This holds for every item, including the last ones and any spares.`,
    );
  }
  if (request.subject === "gs" && request.topic === "healthy-living") {
    lines.push("Safety items test safe habits (what to do, e.g. 濕手不碰插頭、電線破損要告訴大人), never how electricity, circuits, conductors, insulators or materials work.");
  }
  return lines.join("\n");
}

/** Appended to every quiz with Chinese text (chinese, gs, maths). Rules only — no example questions. */
const HK_WORDING = [
  "HK WORDING (zh):",
  "- Standard Hong Kong written Chinese (書面語), Traditional characters in HK school forms: 甚麼 (not 什麼), 裏 (not 裡), 着 for zhe/zhuó (穿着, 着急; but 著名, 顯著, 著作 keep 著), 綫/線 as HK textbooks use.",
  "- Use HK vocabulary, not Mainland or Taiwan terms: 巴士 (not 公車/公交), 雪櫃 (not 冰箱), 擦膠 (not 橡皮擦/橡皮), 的士 (not 計程車), 港鐵 (not 捷運/地鐵), 乳酪 (not 優酪乳), 菠蘿 (not 鳳梨), 薯仔 (not 馬鈴薯/土豆), 單車 (not 腳踏車/自行車), 嫲嫲 for 爸爸的媽媽 (not 奶奶), 粒 for small round food like 糖/魚蛋/葡萄 (not 顆; apples and oranges stay 個); 番茄 is fine.",
  "- No spoken Cantonese (食咗, 幾多, 佢, 唔, 邊個, 落雨) unless a 病句 / 口語 item deliberately tests it.",
  "- Answers must be factually correct in a Hong Kong setting (e.g. MTR etiquette; school roles and places such as 校長室 vs 校務處).",
  "- Stay on the requested topic; do not drift into another subject or topic.",
].join(" ");

function languageGuidance(subject: SubjectSlug): string {
  if (subject === "chinese") {
    return [
      "LANGUAGE (chinese subject — CRITICAL):",
      "- Primary learning content MUST be Traditional Chinese (zh): prompts, passages, explanations, hints, MC choices, and answers.",
      "- NEVER write English-only question stems for Chinese quizzes. Stems must be Traditional Chinese.",
      "- en may be omitted, or a brief English gloss only — never use en as the primary stem while zh is missing or weaker.",
      "- Choices and answers MUST be Traditional Chinese (or Chinese measure words / characters), never English-only options for a Chinese vocab item.",
      "- Do not mix: never write an English stem with Chinese-only choices, or a Chinese stem with English-only grammar choices unless the topic is translation.",
      HK_WORDING,
    ].join(" ");
  }
  if (subject === "english") {
    return [
      "LANGUAGE (english subject — CRITICAL):",
      "- Primary learning content MUST be English (en): prompts, passages, explanations, hints, MC choices, and answers.",
      "- Grammar / vocabulary / reading stems must be English sentences or English blanks.",
      "- NEVER write Traditional Chinese question stems for English quizzes. zh may be a brief Traditional Chinese gloss of the English stem, or omitted.",
      "- Choices and answers MUST be English (or English grammar forms), never Chinese characters as the answer options for an English grammar item.",
    ].join(" ");
  }
  if (subject === "gs") {
    return [
      "LANGUAGE (gs / 常識 subject — CRITICAL):",
      "- Primary learning content MUST be Traditional Chinese (zh): prompts, passages, explanations, hints, MC choices, and answers.",
      "- NEVER write English-only question stems for 常識 quizzes. Stems must be Traditional Chinese (HK primary General Studies flavour).",
      "- en may be omitted, or a brief English gloss only — never use en as the primary stem while zh is missing or weaker.",
      "- Choices and answers MUST be Traditional Chinese (or short HK-familiar terms), never English-only options for a 常識 item.",
      "- Kid-friendly HK daily-life settings; keep national-identity content light or skip.",
      HK_WORDING,
    ].join(" ");
  }
  return [
    "LANGUAGE (maths subject):",
    "Bilingual prompts are OK (zh Traditional Chinese + en English) — both locales should be complete and parallel.",
    "Numeric answers as plain number strings (prefer \"6\" not \"6 元\" or \"$6\").",
    "MC choices: prefer bare numbers so they work under both UI languages.",
    "CRITICAL — do NOT mix: never write an English-primary stem (or EN UI money story) with Chinese-only choice labels like \"8 元\", \"10 元\".",
    "If you must label currency/units in choices, keep them bilingual/parallel with the stem language — never Chinese-unit-only choices alongside an English stem.",
    HK_WORDING,
  ].join(" ");
}


/**
 * Retrieved EDB chunks (if any) followed by the per-year limits block.
 * The limits block is always present and comes last so it wins on conflicts.
 */
function curriculumContext(request: QuizRequest): string {
  const retrieved = retrieveCurriculumContext({
    subject: request.subject,
    year: request.year,
    topic: request.topic,
    limit: 5,
  });
  const guidance = curriculumGuidanceBlock(request.year, request.subject, request.topic, request.seed);
  return retrieved ? `${retrieved}\n${guidance}` : guidance;
}

/** Spare items asked for in the first call so a dropped item rarely needs a backfill round trip. */
export const FIRST_CALL_EXTRA = 2;

export function buildQuizPrompt(request: QuizRequest): { system: string; user: string } {
  const label = topicLabel(request.subject, request.topic);
  const count = (QUIZ_COUNTS as readonly number[]).includes(request.count)
    ? request.count
    : QUIZ_COUNTS[0];

  const system = [
    "You are a Hong Kong primary school (P1–P6) quiz writer.",
    "Return JSON only — no markdown fences, no commentary.",
    "Output a JSON array of question objects with this exact shape:",
    '[{"id":"q1","type":"mc"|"fill"|"number"|"match","prompt":{"zh":"...","en":"..."},"passage":{"zh":"...","en":"..."}|optional,"choices":["..."]|required for mc (optional distractor set for fill),"answer":"..."|omit for match,"accepts":["..."]|optional for fill,"pairs":[{"left":"...","right":"..."}]|required for match (4–5 pairs),"hint":{"zh":"...","en":"..."}|optional,"explanation":{"zh":"...","en":"..."}|optional}]',
    "Rules:",
    "- Exactly the requested number of questions (Question count).",
    "- Every prompt is self-contained: it holds the actual sentence, blank or question (e.g. \"While I ___ my homework, the lights went out.\"), never only an instruction such as \"Choose the correct verb form.\"",
    "- For type mc: provide exactly 4 distinct choices (never 3, never duplicates); answer must equal one choice exactly. Distractors are real, plausible forms (e.g. cat / cats / cat's), never invented misspellings, and each must be clearly wrong in that sentence (e.g. for an a/an blank do not offer \"the\" or \"this\").",
    "- For type match: 4–5 pairs (use the count the ANSWER TYPES block asks for); all lefts unique, all rights unique, exactly one correct right for each left. The app shuffles the right side.",
    "- Obey the ANSWER TYPES block for the year (which types are allowed and how many).",
    "- For type fill: answer is the canonical accepted spelling; accepts may list alternatives.",
    "- For type number: answer is a numeric string. Plain decimals/integers (e.g. \"0.75\", \"12\") are preferred. Fraction strings like \"5/6\" are also allowed when the value is a fraction — the UI accepts text input for those.",
    "- Every fraction answer (and every fraction MC choice that is correct) must be in lowest terms, as a mixed number where the year uses them, unless the question explicitly asks for an unsimplified form.",
    "- When the learner must write a fraction in lowest terms (最簡分數 / simplify), prefer type \"fill\" with answer like \"5/6\" (accepts may include \"5 / 6\"). Do NOT use type number for slash answers unless the answer string itself contains /.",
    "- Difficulty is set per YEAR, not per key stage: obey every \"LIMIT\" line in the CURRICULUM / DIFFICULTY block (lengths, number ranges, allowed grammar/words). Each year must be clearly harder than the year below and easier than the year above.",
    "- Before answering, check every question against the year limits; replace any question that breaks one.",
    "- HK curriculum flavour; culturally familiar HK examples where helpful.",
    "- ids must be unique strings.",
    "- Several items on the same passage: give the full \"passage\" only on the first of them; the others carry \"passageRef\": \"<that item's id>\" instead of repeating the text.",
    "- Place the correct MC answer in a random position among the 4 choices; do not always put it first.",
    "- Vary templates, settings, vocabulary, and numbers across questions; the seed is a variety token, not a PRNG.",
  ].join("\n");

  const avoid = (request.avoidPrompts ?? [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .slice(0, AVOID_MAX)
    .map((s) => s.slice(0, AVOID_STEM_MAX));

  const userParts = [
    `Subject: ${request.subject}`,
    `Topic: ${label.en} / ${label.zh} (slug: ${request.topic})`,
    `Year: ${request.year}`,
    topicScopeBlock(request),
    `Question count: ${count + FIRST_CALL_EXTRA} (${count} are used; the ${FIRST_CALL_EXTRA} spare items replace any that fail a check)`,
    `Seed (variety token — produce a distinct quiz for each seed): ${request.seed}`,
    languageGuidance(request.subject),
    curriculumContext(request),
    answerTypeGuidance(request.year, request.subject, request.seed),
    "Within the ANSWER TYPES allowed for the year, prefer types that fit the topic (e.g. maths decimals/of-a-total → number; maths simplify-to-fraction → fill with answer like \"2/3\"; English grammar → mc; Chinese vocab → mc, match or fill). If the topic and the year limits conflict, the year limits win (write easier items within the topic).",
  ];
  if (avoid.length) {
    userParts.push(
      "SEEN (items this learner already did; stem → answer). Do not repeat them: use different sentences, facts and examples (the same grammar point or answer word is fine):",
      ...avoid.map((s) => `- ${s}`),
    );
  }
  userParts.push("Return the JSON array now.");
  const user = userParts.join("\n");

  return { system, user };
}

function asLocalized(value: unknown): Localized | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? { zh: trimmed, en: trimmed } : undefined;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const zh = typeof obj.zh === "string" ? obj.zh.trim() : undefined;
    const en = typeof obj.en === "string" ? obj.en.trim() : undefined;
    if (zh || en) return { zh, en };
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function asType(value: unknown): QuizQuestionType | undefined {
  return value === "mc" || value === "fill" || value === "number" || value === "match"
    ? value
    : undefined;
}

function asPairs(value: unknown): QuizMatchPair[] {
  if (!Array.isArray(value)) return [];
  const out: QuizMatchPair[] = [];
  for (const p of value) {
    const [left, right] = Array.isArray(p)
      ? [asString(p[0]), asString(p[1])]
      : p && typeof p === "object"
        ? [asString((p as Record<string, unknown>).left), asString((p as Record<string, unknown>).right)]
        : [undefined, undefined];
    if (left && right) out.push({ left, right });
  }
  return out;
}

function extractJsonArray(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    return JSON.parse(fence[1].trim());
  }
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error("Model response was not valid JSON");
}

/**
 * Parse the model's JSON. With `rules`, the year's answer-type rules are applied
 * (repair → mc or drop), so the result may hold fewer than `expectedCount` items.
 */
export function parseQuizQuestions(
  rawContent: string,
  expectedCount: number,
  seed = 0,
  rules?: Pick<QuizRequest, "year" | "subject">,
): QuizQuestion[] {
  const parsed = extractJsonArray(rawContent);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Model returned an empty or non-array quiz");
  }

  const questions: QuizQuestion[] = [];
  /** Passages by item id, so later items can say "passageRef": "<id>" instead of repeating it. */
  const passagesById = new Map<string, Localized>();
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const type = asType(row.type);
    const prompt = asLocalized(row.prompt);
    const pairs = type === "match" ? asPairs(row.pairs) : [];
    const answer = type === "match" ? "" : asString(row.answer);
    if (!type || !prompt || answer === undefined) continue;

    const id = asString(row.id) || `llm-q${i + 1}`;
    const question: QuizQuestion = {
      id,
      type,
      prompt,
      answer,
    };

    const ref = asString(row.passageRef);
    const passage = asLocalized(row.passage) ?? (ref ? passagesById.get(ref) : undefined);
    if (passage) {
      question.passage = passage;
      passagesById.set(id, passage);
      const rawId = asString(row.id);
      if (rawId) passagesById.set(rawId, passage);
    }
    const hint = asLocalized(row.hint);
    if (hint) question.hint = hint;
    const explanation = asLocalized(row.explanation);
    if (explanation) question.explanation = explanation;

    if (type === "match") question.pairs = pairs;

    if (type === "mc" || type === "fill" || type === "number") {
      const rawChoices = Array.isArray(row.choices)
        ? row.choices.map(asString).filter((c): c is string => Boolean(c))
        : [];
      // Deduplicate while preserving order (duplicate React keys / identical options).
      const choices: string[] = [];
      for (const c of rawChoices) {
        if (!choices.includes(c)) choices.push(c);
      }
      if (type === "mc" && choices.length < 2) continue;
      if (choices.length) question.choices = choices;
    }

    if (type === "mc" && !rules) {
      const choices = question.choices ?? [];
      if (!choices.includes(answer)) {
        // Inject missing answer; shuffle below so it is not stuck in slot 0.
        choices[0] = answer;
      }
      // Cap at 6, then shuffle with seed + question index so positions vary
      // across items but stay stable for a given quiz seed.
      const capped = choices.slice(0, 6);
      const rng = mulberry32((seed >>> 0) + Math.imul(i + 1, 9973));
      question.choices = shuffle(rng, capped);
    }

    if (type === "fill" && Array.isArray(row.accepts)) {
      const accepts = row.accepts.map(asString).filter((c): c is string => Boolean(c));
      if (accepts.length) question.accepts = accepts;
    }

    questions.push(question);
  }

  const stats: RuleStats = { toMc: 0, repairedMc: 0, dropped: 0 };
  const checked = rules
    ? enforceAnswerTypes(questions, { year: rules.year, subject: rules.subject, seed }, stats)
    : questions;
  if (rules && (stats.toMc || stats.repairedMc || stats.dropped)) {
    console.info(
      `[quiz/rules] ${rules.subject} ${rules.year}: parsed=${questions.length} kept=${checked.length} toMc=${stats.toMc} repairedMc=${stats.repairedMc} dropped=${stats.dropped}${stats.drops?.length ? ` — ${stats.drops.map((d) => `${d.reason}: ${d.item}`).join(" | ")}` : ""}`,
    );
  }
  if (checked.length === 0) {
    throw new Error("No valid questions could be parsed from the model response");
  }

  const target = Number.isInteger(expectedCount) && expectedCount > 0 ? Math.min(expectedCount, 20) : QUIZ_COUNTS[0];
  const sliced = checked.slice(0, target);
  // Ensure unique ids even if the model repeated them.
  const seen = new Set<string>();
  return sliced.map((q, i) => {
    let id = q.id;
    if (!id || seen.has(id)) id = `${q.id || "q"}-${i + 1}`;
    seen.add(id);
    return id === q.id ? q : { ...q, id };
  });
}

/** Count CJK ideographs in a string (Han script). */
function countCjk(text: string): number {
  const matches = text.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g);
  return matches ? matches.length : 0;
}

/** True when the string is mostly Latin/ASCII letters and punctuation (English-like). */
function isMostlyEnglish(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const cjk = countCjk(trimmed);
  const letters = (trimmed.match(/[A-Za-z]/g) || []).length;
  if (letters === 0) return false;
  // Substantial CJK relative to Latin → not English-primary.
  if (cjk >= 4 && cjk >= letters * 0.4) return false;
  return letters >= 3;
}

/** True when zh has enough CJK to be a Chinese-primary learning stem. */
function isChineseHeavy(text: string | undefined): boolean {
  if (!text?.trim()) return false;
  return countCjk(text) >= 4;
}

/**
 * For english subject: ensure zh-HK UI (toText prefers zh) still shows English
 * learning content by using en as the display source (copy en → zh).
 * Heuristic: if zh is Chinese-heavy and en is missing/unusable, blank the field.
 * For chinese / gs subjects: ensure EN UI (toText prefers en) still shows Traditional
 * Chinese by copying zh → en. Heuristic: if en is Latin-heavy with no usable zh,
 * blank the field. Maths: no-op.
 */
export function normalizeLocalizedForSubject(
  field: Localized | undefined,
  subject: SubjectSlug,
): Localized | undefined {
  if (!field) return undefined;
  const en = field.en?.trim() || undefined;
  const zh = field.zh?.trim() || undefined;

  if (subject === "english") {
    // Usable English → always mirror to zh so toText("zh-HK") shows English learning content.
    if (en && isMostlyEnglish(en)) {
      return { en, zh: en };
    }
    // Chinese-heavy zh with no usable English stem → blank (do not show Chinese on English quizzes).
    if (isChineseHeavy(zh)) {
      return undefined;
    }
    // Remaining: short gloss / already-English zh, or thin en.
    if (en) return { en, zh: en };
    if (zh) return { en: zh, zh };
    return undefined;
  }

  if (subject === "chinese" || subject === "gs") {
    // Usable Chinese → always mirror to en so toText("en") shows Traditional Chinese learning content.
    if (zh && isChineseHeavy(zh)) {
      return { zh, en: zh };
    }
    // Chinese was only in en → use it for both locales.
    if (en && isChineseHeavy(en)) {
      return { zh: en, en };
    }
    // Short Chinese stems (P1 limit is ≤15 字, e.g. 「我用眼睛＿＿。」) have <4 characters
    // but are still Chinese — keep them rather than blanking the question.
    if (zh && countCjk(zh) > 0) {
      return { zh, en: zh };
    }
    // Latin-heavy en with no usable Chinese stem → blank (do not show English on Chinese/GS quizzes).
    if (en && isMostlyEnglish(en)) {
      return undefined;
    }
    // Remaining: short CJK gloss / thin fields.
    if (zh) return { zh, en: zh };
    if (en) return { zh: en, en };
    return undefined;
  }

  return zh || en ? { zh, en } : undefined;
}

/**
 * Post-parse guardrail: align localized learning fields with the subject
 * so UI chrome language does not leak into learning content
 * (zh-HK UI ≠ Chinese stems on English quizzes; EN UI ≠ English stems on Chinese quizzes).
 */
export function normalizeQuizForSubject(quiz: Quiz): Quiz {
  const { subject } = quiz;
  if (subject !== "english" && subject !== "chinese" && subject !== "gs") {
    return quiz;
  }

  const questions = quiz.questions.map((q) => {
    const normalizedPrompt = normalizeLocalizedForSubject(q.prompt, subject);
    // prompt is required; if subject wiped a wrong-language stem, use empty rather than keeping it.
    const prompt: Localized =
      normalizedPrompt ??
      (subject === "english" || subject === "chinese" || subject === "gs"
        ? { en: "", zh: "" }
        : q.prompt);

    const next: QuizQuestion = { ...q, prompt };

    const passage = normalizeLocalizedForSubject(q.passage, subject);
    if (passage) next.passage = passage;
    else delete next.passage;

    const hint = normalizeLocalizedForSubject(q.hint, subject);
    if (hint) next.hint = hint;
    else delete next.hint;

    const explanation = normalizeLocalizedForSubject(q.explanation, subject);
    if (explanation) next.explanation = explanation;
    else delete next.explanation;

    return next;
  });

  return { ...quiz, questions };
}

export function toQuiz(request: QuizRequest, questions: QuizQuestion[]): Quiz {
  const quiz: Quiz = {
    id: `quiz-llm-${request.subject}-${request.topic}-${request.year}-${request.seed}`,
    subject: request.subject,
    topic: request.topic,
    year: request.year,
    questions,
    seed: request.seed,
  };
  return normalizeQuizForSubject(applyHkForms(quiz));
}

export type LlmChatResult = {
  content: string;
  model: string;
};

type ChatOptions = { timeoutMs?: number; thinking?: "low" | "off" };

/**
 * DeepSeek reasoning controls. With default reasoning the model sometimes
 * spends the whole max_tokens budget thinking (finish_reason=length, empty or
 * cut-off JSON). First attempt: low effort; retry: thinking off (fast, ~5–10 s).
 * Only sent to DeepSeek models — other OpenAI-compatible hosts may reject them.
 */
function thinkingParams(model: string, thinking: ChatOptions["thinking"]): Record<string, unknown> {
  if (!thinking) return {};
  if (/deepseek/i.test(model)) {
    return thinking === "off" ? { thinking: { type: "disabled" } } : { reasoning_effort: "low" };
  }
  if (/gpt-/i.test(model)) {
    // GPT reasoning models (gpt-6-luna): keep medium thinking for the quiz itself — in our
    // eval "low"/"none" were 2–3× faster but produced 3–4× more wrong/ambiguous/off-topic
    // items. Retries and the small backfill call use "none". LLM_REASONING_EFFORT overrides.
    const effort = thinking === "off" ? "none" : process.env.LLM_REASONING_EFFORT?.trim() || "medium";
    return { reasoning_effort: effort };
  }
  return {};
}

type ChatMessage = { content?: unknown; reasoning_content?: unknown; reasoning?: unknown };

/** Errors worth one more attempt: empty/garbled output, rate limits, server errors, timeouts. */
class RetryableLlmError extends Error {}

/**
 * Message text to parse. Some reasoning models occasionally put the whole
 * answer in `reasoning_content` and leave `content` empty — use the reasoning
 * text only when it really contains a JSON array.
 */
function messageText(message: ChatMessage | undefined): string | undefined {
  if (typeof message?.content === "string" && message.content.trim()) return message.content;
  for (const field of [message?.reasoning_content, message?.reasoning]) {
    if (typeof field !== "string" || !field.includes("[")) continue;
    try {
      const parsed = extractJsonArray(field);
      if (Array.isArray(parsed) && parsed.length) return JSON.stringify(parsed);
    } catch {
      /* not usable */
    }
  }
  return undefined;
}

export async function callChatCompletion(
  system: string,
  user: string,
  sessionId: string,
  options: ChatOptions = {},
): Promise<LlmChatResult> {
  const { apiKey, baseUrl, model } = getLlmConfig();
  if (!apiKey) {
    throw new Error("LLM_API_KEY (or OPENCODE_GO_API_KEY) is not configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    };
    // OpenCode Go expects a stable session header; omit for other OpenAI-compatible hosts.
    if (isOpenCodeBaseUrl(baseUrl)) {
      headers["x-opencode-session"] = sessionId;
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: maxTokensFor(model),
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          ...thinkingParams(model, options.thinking),
        }),
        signal: controller.signal,
      });
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      throw new RetryableLlmError(aborted ? "LLM request timed out" : "LLM request failed");
    }

    const text = await res.text();
    if (!res.ok) {
      // Never include headers or key material; truncate body for logs.
      const snippet = text.replace(/\s+/g, " ").slice(0, 160);
      const message = `LLM HTTP ${res.status}: ${snippet || res.statusText}`;
      throw res.status === 429 || res.status >= 500 ? new RetryableLlmError(message) : new Error(message);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new RetryableLlmError("LLM returned non-JSON");
    }

    const choice =
      data && typeof data === "object" && Array.isArray((data as { choices?: unknown }).choices)
        ? (data as { choices: Array<{ message?: ChatMessage; finish_reason?: unknown }> }).choices[0]
        : undefined;
    const content = messageText(choice?.message);

    if (!content) {
      const reason = typeof choice?.finish_reason === "string" ? ` (finish_reason=${choice.finish_reason})` : "";
      throw new RetryableLlmError(`LLM response missing message content${reason}`);
    }

    const usedModel =
      data && typeof data === "object" && typeof (data as { model?: unknown }).model === "string"
        ? ((data as { model: string }).model)
        : model;

    return { content, model: usedModel };
  } finally {
    clearTimeout(timer);
  }
}

/** Don't start a backfill call with less time than this left (it runs with thinking off, ~5–10 s). */
const MIN_BACKFILL_MS = 8_000;
/** Time kept back for the offline top-up and the response itself. */
const RESERVE_MS = 1_500;

/**
 * Repeat key: both prompt languages plus the answer. English items often carry a
 * generic zh instruction ("選出正確的字。") and match items a generic stem, so the
 * stem alone (the old `zh || en` key) made distinct items look like repeats.
 */
const stemKey = (q: QuizQuestion) =>
  [q.prompt.zh, q.prompt.en, q.answer].map((s) => (s ?? "").replace(/\s+/g, "").toLowerCase()).join("|");

/**
 * The single place where questions are dropped after parsing: grade rules over
 * the merged set (fill / match caps, passage + numeric-key checks, match
 * exclusivity), repeated stems, then the count cap and unique ids. The shortfall
 * is always measured on this function's output, so nothing can drop items later.
 */
export type FinalizeStats = { rules: number; repeats: number; avoid?: number; topic?: number };

/** Stem, answer, choices and match pairs — what an item actually tests. */
function testedText(q: QuizQuestion): string {
  return [q.prompt.zh, q.prompt.en, q.answer, ...(q.choices ?? []), ...(q.pairs ?? []).flatMap((p) => [p.left, p.right])]
    .filter(Boolean)
    .join(" ");
}

export function finalizeQuestions(
  questions: QuizQuestion[],
  request: QuizRequest,
  stats: FinalizeStats = { rules: 0, repeats: 0 },
): QuizQuestion[] {
  const ruleStats: RuleStats = { toMc: 0, repairedMc: 0, dropped: 0 };
  const ruled = enforceAnswerTypes(questions, { year: request.year, subject: request.subject, seed: request.seed }, ruleStats);
  stats.rules += ruleStats.dropped;
  const avoidKeys = parseAvoidKeys(request.avoidPrompts?.slice(0, AVOID_MAX));
  const offTopic = offTopicTerms(request.subject, request.topic);
  const stems = new Set<string>();
  const ids = new Set<string>();
  const out: QuizQuestion[] = [];
  for (const q of ruled) {
    const key = stemKey(q);
    if (key && stems.has(key)) {
      stats.repeats += 1;
      continue;
    }
    stems.add(key);
    // Uses a term that only belongs to another topic of the subject (e.g. 導電體 in 健康生活).
    if (offTopic?.test(testedText(q))) {
      stats.topic = (stats.topic ?? 0) + 1;
      continue;
    }
    // Near-repeat of an item the learner saw in an earlier quiz (avoidPrompts).
    if (matchesAvoid(q, avoidKeys)) {
      stats.avoid = (stats.avoid ?? 0) + 1;
      continue;
    }
    let id = q.id || `q${out.length + 1}`;
    while (ids.has(id)) id = `${id}-${out.length + 1}`;
    ids.add(id);
    out.push(id === q.id ? q : { ...q, id });
    if (out.length === request.count) break;
  }
  return out;
}

/**
 * Top up from the offline generator (same grade rules, subject, topic), skipping
 * stems already in the quiz. Tries a few seeds; small banks may still fall short.
 */
export function topUpFromFallback(questions: QuizQuestion[], quizRequest: QuizRequest): QuizQuestion[] {
  // The small offline bank is the last resort: never filtered by the avoid list, so the quiz still fills.
  const request: QuizRequest = { ...quizRequest, avoidPrompts: undefined };
  let merged = questions;
  for (let attempt = 1; attempt <= 4 && merged.length < request.count; attempt++) {
    const have = new Set(merged.map(stemKey));
    const extra = buildRuledQuestions({ ...request, seed: request.seed + attempt * 104_729 })
      .filter((q) => !have.has(stemKey(q)))
      .map((q) => ({ ...q, id: `fb${attempt}-${q.id}` }));
    merged = finalizeQuestions([...merged, ...extra], request);
  }
  return merged;
}

/** Quizzes of at least this many items are written as two parallel half-quizzes. */
export const SPLIT_MIN_COUNT = 8;

/**
 * Prompt for one half of a split quiz: asks for half the items plus one spare, and
 * gives each half a different focus so the two parallel calls rarely overlap.
 */
export function partUserPrompt(user: string, count: number, part: 1 | 2): string {
  const ask = Math.ceil(count / 2) + 1;
  const note =
    part === 1
      ? `PART 1 of 2: this quiz is written in two parts at the same time. Write ${ask} items on the FIRST half of the topic's sub-skills, with simpler settings; any match item goes in this part.`
      : `PART 2 of 2: this quiz is written in two parts at the same time. Write ${ask} items on the SECOND half of the topic's sub-skills, with different settings, names and vocabulary from a typical first half; do NOT include a match item.`;
  return user
    .replace(/^Question count: .*$/m, `Question count: ${ask}`)
    .replace(/Return the JSON array now\.$/, `${note}\nReturn the JSON array now.`);
}

/** Which pipeline step produced an item, from its id prefix (logged per slot). */
function slotSource(id: string): string {
  if (id.startsWith("p1-")) return "h1";
  if (id.startsWith("p2-")) return "h2";
  if (id.startsWith("b-")) return "bf";
  if (id.startsWith("fb")) return "off";
  return "one";
}

export type FillPath = "none" | "backfill" | "fallback" | "backfill+fallback" | "short";

type GenerateDeps = {
  chat?: typeof callChatCompletion;
  /** Write quizzes of SPLIT_MIN_COUNT+ items as two parallel halves (default true). */
  split?: boolean;
  now?: () => number;
  log?: (line: string) => void;
};

/**
 * Call the model and parse the quiz (answer-type rules applied), retrying once
 * (thinking off, so it is fast) when the reply is empty, unparseable,
 * rate-limited or a server error. A shortfall (items dropped by any check) is
 * filled by one backfill call when the time budget allows, then from the offline
 * generator, so the quiz always has the requested count. `[quiz/fill]` logs the path.
 */
export async function generateQuizQuestions(
  system: string,
  user: string,
  sessionId: string,
  request: QuizRequest,
  deps: GenerateDeps = {},
): Promise<{ questions: QuizQuestion[]; model: string; attempts: number; fill: FillPath }> {
  const chat = deps.chat ?? callChatCompletion;
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((line: string) => console.info(line));
  const { count, seed } = request;
  const deadline = now() + TOTAL_BUDGET_MS;
  let lastError: unknown;
  let result: { questions: QuizQuestion[]; model: string; attempts: number } | undefined;
  const fin: FinalizeStats = { rules: 0, repeats: 0, avoid: 0, topic: 0 };
  let rawCount = 0;
  const firstReplyLog = (parsed: QuizQuestion[], note = "") => {
    if (fin.rules || fin.repeats || fin.avoid || fin.topic || parsed.length < count) {
      log(`[quiz/fill] ${request.subject}/${request.topic} ${request.year} seed=${seed} first reply${note}: ${rawCount} valid, repeats=${fin.repeats} ruleDrops=${fin.rules} avoidDrops=${fin.avoid} topicDrops=${fin.topic}, kept ${parsed.length}/${count}`);
    }
  };

  // Attempt 1 for longer quizzes: two half-quizzes in parallel (each call thinks and
  // writes about half as much, so the wall time is roughly that of a short quiz).
  if ((deps.split ?? true) && count >= SPLIT_MIN_COUNT) {
    const calls = ([1, 2] as const).map(async (part) => {
      const { content, model } = await chat(system, partUserPrompt(user, count, part), `${sessionId}-p${part}`, {
        timeoutMs: Math.min(TIMEOUT_MS, deadline - now()),
        thinking: "low",
      });
      const items = parseQuizQuestions(content, Math.ceil(count / 2) + 1, seed + part - 1, request).map((q) => ({
        ...q,
        id: `p${part}-${q.id}`,
      }));
      return { items, model };
    });
    const settled = await Promise.allSettled(calls);
    const ok = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    for (const r of settled) {
      if (r.status === "rejected") {
        lastError = r.reason;
        log(`[quiz/fill] ${request.subject}/${request.topic} ${request.year} seed=${seed} split part failed: ${r.reason instanceof Error ? r.reason.message : r.reason}`);
      }
    }
    if (ok.length) {
      // Interleave the halves so both parts' items survive the count cap.
      const merged: QuizQuestion[] = [];
      const [a, b = { items: [] as QuizQuestion[] }] = ok;
      for (let i = 0; i < Math.max(a.items.length, b.items.length); i++) {
        if (a.items[i]) merged.push(a.items[i]);
        if (b.items[i]) merged.push(b.items[i]);
      }
      rawCount = merged.length;
      const parsed = finalizeQuestions(merged, request, fin);
      firstReplyLog(parsed, ` (split ${ok.length}/2)`);
      result = { questions: parsed, model: ok[0].model, attempts: 1 };
    }
  }

  for (let attempt = result ? 3 : 1; attempt <= 2 && !result; attempt++) {
    const remaining = deadline - now();
    if (attempt > 1 && remaining < MIN_RETRY_MS) break;
    try {
      const { content, model } = await chat(system, user, sessionId, {
        timeoutMs: Math.min(TIMEOUT_MS, remaining),
        thinking: attempt === 1 && !lastError ? "low" : "off",
      });
      try {
        const raw = parseQuizQuestions(content, count + FIRST_CALL_EXTRA, seed, request);
        rawCount = raw.length;
        const parsed = finalizeQuestions(raw, request, fin);
        firstReplyLog(parsed);
        result = { questions: parsed, model, attempts: attempt };
      } catch (err) {
        throw new RetryableLlmError(err instanceof Error ? err.message : "Unparseable quiz");
      }
    } catch (err) {
      lastError = err;
      if (!(err instanceof RetryableLlmError)) break;
      console.warn(`[quiz/generate] attempt ${attempt} failed: ${err.message}`);
    }
  }
  if (!result) throw lastError instanceof Error ? lastError : new Error("LLM generation failed");

  const tag = `[quiz/fill] ${request.subject}/${request.topic} ${request.year} seed=${seed}`;
  const done = <T extends { questions: QuizQuestion[] }>(r: T, fill: FillPath) => {
    log(`${tag} count=${count} fill=${fill} slots=${r.questions.map((q) => slotSource(q.id)).join(",")}`);
    return { ...r, fill };
  };
  const firstMissing = count - result.questions.length;
  if (firstMissing <= 0) return done(result, "none");

  let backfilled = 0;
  const remaining = deadline - now() - RESERVE_MS;
  if (remaining < MIN_BACKFILL_MS) {
    log(`${tag} missing=${firstMissing} backfill skipped (${Math.max(0, Math.round(remaining))}ms left)`);
  } else {
    const have = result.questions.map((q) => [q.prompt.en, q.prompt.zh].filter(Boolean).join(" / ").slice(0, 160));
    // Ask for a little extra: some of what comes back may be dropped again.
    const ask = firstMissing + 1;
    // `user` already carries the SEEN (avoidPrompts) block, so backfill items avoid it too.
    const backfillUser = [
      user,
      `BACKFILL: return a JSON array of exactly ${ask} NEW question(s) (not ${count}), same rules and ANSWER TYPES. Do not repeat these stems:`,
      ...have.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n");
    try {
      const { content } = await chat(system, backfillUser, `${sessionId}-fill`, {
        timeoutMs: Math.min(TIMEOUT_MS, remaining),
        thinking: "off",
      });
      const extra = parseQuizQuestions(content, QUIZ_COUNTS[QUIZ_COUNTS.length - 1], seed + 7919, request).map((q) => ({
        ...q,
        id: `b-${q.id}`,
      }));
      const before = result.questions.length;
      const bfStats: FinalizeStats = { rules: 0, repeats: 0, avoid: 0, topic: 0 };
      result.questions = finalizeQuestions([...result.questions, ...extra], request, bfStats);
      backfilled = result.questions.length - before;
      result.attempts += 1;
      log(`${tag} missing=${firstMissing} backfill +${backfilled} (got ${extra.length}, kept ${backfilled}, avoidDrops=${bfStats.avoid} topicDrops=${bfStats.topic})`);
    } catch (err) {
      log(`${tag} missing=${firstMissing} backfill failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (result.questions.length >= count) return done(result, "backfill");
  const before = result.questions.length;
  result.questions = topUpFromFallback(result.questions, request);
  const added = result.questions.length - before;
  const short = count - result.questions.length;
  log(`${tag} fallback +${added}${short > 0 ? ` (still ${short} short)` : ""}`);
  const fill: FillPath = short > 0 ? "short" : backfilled > 0 ? "backfill+fallback" : "fallback";
  return done(result, fill);
}

export function isValidYear(value: unknown): value is Year {
  return (
    value === "P1" ||
    value === "P2" ||
    value === "P3" ||
    value === "P4" ||
    value === "P5" ||
    value === "P6"
  );
}

export function isValidSubject(value: unknown): value is SubjectSlug {
  return value === "chinese" || value === "english" || value === "maths" || value === "gs";
}
