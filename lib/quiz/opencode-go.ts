/**
 * Server-only helpers for calling OpenCode Go chat completions.
 * Never import this from client components.
 */

import type { SubjectSlug, Year } from "@/lib/curriculum";
import type { Localized } from "@/lib/i18n/types";
import type { Quiz, QuizQuestion, QuizQuestionType, QuizRequest } from "./types";
import { QUIZ_COUNTS } from "./types";

const DEFAULT_BASE = "https://opencode.ai/zen/go/v1";
const DEFAULT_MODEL = "deepseek-v4.1-flash";
const TIMEOUT_MS = 55_000;
const USER_AGENT = "hk-primary-learn/0.1";

export function getOpenCodeGoConfig(): {
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
} {
  return {
    apiKey: process.env.OPENCODE_GO_API_KEY?.trim() || undefined,
    baseUrl: (process.env.OPENCODE_GO_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, ""),
    model: process.env.OPENCODE_GO_MODEL?.trim() || DEFAULT_MODEL,
  };
}

const TOPIC_LABELS: Record<string, { zh: string; en: string }> = {
  "chinese/vocab": { zh: "詞語", en: "Vocabulary" },
  "chinese/reading": { zh: "閱讀理解", en: "Reading comprehension" },
  "chinese/sentences": { zh: "病句與造句", en: "Sentence correction" },
  "english/vocabulary": { zh: "英文詞彙", en: "English vocabulary" },
  "english/reading": { zh: "英文閱讀", en: "English reading" },
  "english/grammar": { zh: "文法", en: "Grammar" },
  "maths/fractions": { zh: "分數", en: "Fractions" },
  "maths/decimals": { zh: "小數", en: "Decimals" },
  "maths/word-problems": { zh: "應用題", en: "Word problems" },
};

function topicLabel(subject: SubjectSlug, topic: string): { zh: string; en: string } {
  return TOPIC_LABELS[`${subject}/${topic}`] ?? { zh: topic, en: topic };
}

function languageGuidance(subject: SubjectSlug): string {
  if (subject === "chinese") {
    return [
      "LANGUAGE (chinese subject — CRITICAL):",
      "- Primary learning content MUST be Traditional Chinese (zh): prompts, passages, explanations, hints, MC choices, and answers.",
      "- NEVER write English-only question stems for Chinese quizzes. Stems must be Traditional Chinese (e.g. \"選出最適當的量詞：中秋夜，一家人欣賞__明月。\" with choices 個/輪/隻/條).",
      "- en may be omitted, or a brief English gloss only — never use en as the primary stem while zh is missing or weaker.",
      "- Choices and answers MUST be Traditional Chinese (or Chinese measure words / characters), never English-only options for a Chinese vocab item.",
      "- Do not mix: never write an English stem with Chinese-only choices, or a Chinese stem with English-only grammar choices unless the topic is translation.",
    ].join(" ");
  }
  if (subject === "english") {
    return [
      "LANGUAGE (english subject — CRITICAL):",
      "- Primary learning content MUST be English (en): prompts, passages, explanations, hints, MC choices, and answers.",
      "- Grammar / vocabulary / reading stems must be English sentences or English blanks (e.g. \"My sister ___ to school by bus every day.\" with choices go/goes/going/went).",
      "- NEVER write Traditional Chinese question stems for English quizzes. zh may be a brief Traditional Chinese gloss of the English stem, or omitted.",
      "- Choices and answers MUST be English (or English grammar forms), never Chinese characters as the answer options for an English grammar item.",
    ].join(" ");
  }
  return [
    "LANGUAGE (maths subject):",
    "Bilingual prompts are OK (zh Traditional Chinese + en English).",
    "Numeric answers as strings. MC choices may be numbers or short bilingual phrases.",
  ].join(" ");
}

export function buildQuizPrompt(request: QuizRequest): { system: string; user: string } {
  const label = topicLabel(request.subject, request.topic);
  const count = (QUIZ_COUNTS as readonly number[]).includes(request.count)
    ? request.count
    : QUIZ_COUNTS[0];

  const system = [
    "You are a Hong Kong primary school (P4–P6) quiz writer.",
    "Return JSON only — no markdown fences, no commentary.",
    "Output a JSON array of question objects with this exact shape:",
    '[{"id":"q1","type":"mc"|"fill"|"number","prompt":{"zh":"...","en":"..."},"passage":{"zh":"...","en":"..."}|optional,"choices":["..."]|required for mc,"answer":"...","accepts":["..."]|optional for fill,"hint":{"zh":"...","en":"..."}|optional,"explanation":{"zh":"...","en":"..."}|optional}]',
    "Rules:",
    "- Exactly the requested number of questions.",
    "- For type mc: provide 4 distinct choices; answer must equal one choice exactly.",
    "- For type fill: answer is the canonical accepted spelling; accepts may list alternatives.",
    "- For type number: answer is a numeric string. Plain decimals/integers (e.g. \"0.75\", \"12\") are preferred. Fraction strings like \"5/6\" are also allowed when the value is a fraction — the UI accepts text input for those.",
    "- When the learner must write a fraction in lowest terms (最簡分數 / simplify), prefer type \"fill\" with answer like \"5/6\" (accepts may include \"5 / 6\"). Do NOT use type number for slash answers unless the answer string itself contains /.",
    "- Keep difficulty suitable for the given year (P4 easier, P6 harder).",
    "- HK curriculum flavour; culturally familiar HK examples where helpful.",
    "- ids must be unique strings.",
  ].join("\n");

  const user = [
    `Subject: ${request.subject}`,
    `Topic: ${label.en} / ${label.zh} (slug: ${request.topic})`,
    `Year: ${request.year}`,
    `Question count: ${count}`,
    `Seed (for variety, not a PRNG): ${request.seed}`,
    languageGuidance(request.subject),
    "Prefer question types that fit the topic (e.g. maths decimals/of-a-total → number; maths simplify-to-fraction → fill with answer like \"2/3\"; English grammar → mc; Chinese vocab → mc or fill).",
    "Return the JSON array now.",
  ].join("\n");

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
  return value === "mc" || value === "fill" || value === "number" ? value : undefined;
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

export function parseQuizQuestions(rawContent: string, expectedCount: number): QuizQuestion[] {
  const parsed = extractJsonArray(rawContent);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Model returned an empty or non-array quiz");
  }

  const questions: QuizQuestion[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const type = asType(row.type);
    const prompt = asLocalized(row.prompt);
    const answer = asString(row.answer);
    if (!type || !prompt || answer === undefined) continue;

    const id = asString(row.id) || `llm-q${i + 1}`;
    const question: QuizQuestion = {
      id,
      type,
      prompt,
      answer,
    };

    const passage = asLocalized(row.passage);
    if (passage) question.passage = passage;
    const hint = asLocalized(row.hint);
    if (hint) question.hint = hint;
    const explanation = asLocalized(row.explanation);
    if (explanation) question.explanation = explanation;

    if (type === "mc") {
      const rawChoices = Array.isArray(row.choices)
        ? row.choices.map(asString).filter((c): c is string => Boolean(c))
        : [];
      // Deduplicate while preserving order (duplicate React keys / identical options).
      const choices: string[] = [];
      for (const c of rawChoices) {
        if (!choices.includes(c)) choices.push(c);
      }
      if (choices.length < 2) continue;
      if (!choices.includes(answer)) {
        choices[0] = answer;
      }
      // Cap at 6; pad is unlikely but keep at least 2 distinct.
      question.choices = choices.slice(0, 6);
    }

    if (type === "fill" && Array.isArray(row.accepts)) {
      const accepts = row.accepts.map(asString).filter((c): c is string => Boolean(c));
      if (accepts.length) question.accepts = accepts;
    }

    questions.push(question);
  }

  if (questions.length === 0) {
    throw new Error("No valid questions could be parsed from the model response");
  }

  const target = (QUIZ_COUNTS as readonly number[]).includes(expectedCount)
    ? expectedCount
    : QUIZ_COUNTS[0];
  const sliced = questions.slice(0, target);
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
 * For chinese subject: ensure EN UI (toText prefers en) still shows Traditional
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

  if (subject === "chinese") {
    // Usable Chinese → always mirror to en so toText("en") shows Traditional Chinese learning content.
    if (zh && isChineseHeavy(zh)) {
      return { zh, en: zh };
    }
    // Chinese was only in en → use it for both locales.
    if (en && isChineseHeavy(en)) {
      return { zh: en, en };
    }
    // Latin-heavy en with no usable Chinese stem → blank (do not show English on Chinese quizzes).
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
  if (subject !== "english" && subject !== "chinese") {
    return quiz;
  }

  const questions = quiz.questions.map((q) => {
    const normalizedPrompt = normalizeLocalizedForSubject(q.prompt, subject);
    // prompt is required; if subject wiped a wrong-language stem, use empty rather than keeping it.
    const prompt: Localized =
      normalizedPrompt ??
      (subject === "english" || subject === "chinese" ? { en: "", zh: "" } : q.prompt);

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
  return normalizeQuizForSubject(quiz);
}

export type OpenCodeGoResult = {
  content: string;
  model: string;
};

export async function callOpenCodeGoChat(
  system: string,
  user: string,
  sessionId: string,
): Promise<OpenCodeGoResult> {
  const { apiKey, baseUrl, model } = getOpenCodeGoConfig();
  if (!apiKey) {
    throw new Error("OPENCODE_GO_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        "x-opencode-session": sessionId,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 4096,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      // Never include headers or key material; truncate body for logs.
      const snippet = text.replace(/\s+/g, " ").slice(0, 160);
      throw new Error(`OpenCode Go HTTP ${res.status}: ${snippet || res.statusText}`);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("OpenCode Go returned non-JSON");
    }

    const content =
      data &&
      typeof data === "object" &&
      Array.isArray((data as { choices?: unknown }).choices) &&
      (data as { choices: Array<{ message?: { content?: unknown } }> }).choices[0]?.message
        ?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenCode Go response missing message content");
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

export function isValidYear(value: unknown): value is Year {
  return value === "P4" || value === "P5" || value === "P6";
}

export function isValidSubject(value: unknown): value is SubjectSlug {
  return value === "chinese" || value === "english" || value === "maths";
}
