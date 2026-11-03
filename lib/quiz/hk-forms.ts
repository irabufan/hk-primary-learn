/**
 * Deterministic HK character-form fix-ups for Chinese quiz text.
 * Only unambiguous variant swaps (什麼→甚麼, 裡→裏, 著→着); vocabulary swaps
 * (公車→巴士 etc.) are left to the prompt because they depend on meaning.
 */

import type { Localized } from "@/lib/i18n/types";
import type { Quiz, QuizQuestion } from "./types";

/** Words where 著 is zhù (notable / writings) and stays 著 in HK schools. */
const KEEP_ZHU = /著(名|作|者|述|稱)|(顯|名|原|巨|編|論|專|合|拙|譯|遺|新|土|卓|昭)著/g;

export function toHkForms(text: string): string {
  if (!/[什裡著]/.test(text)) return text;
  const kept: string[] = [];
  const masked = text.replace(KEEP_ZHU, (m) => {
    kept.push(m);
    return `\u0000${kept.length - 1}\u0000`;
  });
  return masked
    .replace(/什麼/g, "甚麼")
    .replace(/裡/g, "裏")
    .replace(/著/g, "着")
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => kept[Number(i)]);
}

function fixLocalized(field: Localized | undefined): Localized | undefined {
  if (!field) return field;
  // English text has none of 什裡著, so fixing both locales is a no-op for en.
  return {
    ...field,
    ...(field.zh !== undefined && { zh: toHkForms(field.zh) }),
    ...(field.en !== undefined && { en: toHkForms(field.en) }),
  };
}

function fixQuestion(q: QuizQuestion): QuizQuestion {
  const answer = toHkForms(q.answer);
  const next: QuizQuestion = {
    ...q,
    prompt: fixLocalized(q.prompt) ?? q.prompt,
    answer,
    passage: fixLocalized(q.passage),
    hint: fixLocalized(q.hint),
    explanation: fixLocalized(q.explanation),
  };
  if (q.choices) next.choices = q.choices.map(toHkForms);
  if (q.pairs) next.pairs = q.pairs.map((p) => ({ left: toHkForms(p.left), right: toHkForms(p.right) }));
  if (q.type === "fill" && (q.accepts || answer !== q.answer)) {
    // Keep the original spellings accepted so a learner typing 裡/什麼 is not marked wrong.
    const all = [...(q.accepts ?? []).map(toHkForms), ...(q.accepts ?? []), q.answer];
    next.accepts = [...new Set(all)].filter((a) => a !== answer);
  }
  for (const key of ["passage", "hint", "explanation"] as const) {
    if (next[key] === undefined) delete next[key];
  }
  return next;
}

/** Applies to Chinese-language subjects (chinese, gs, maths zh); English quizzes are untouched. */
export function applyHkForms(quiz: Quiz): Quiz {
  if (quiz.subject === "english") return quiz;
  return { ...quiz, questions: quiz.questions.map(fixQuestion) };
}
