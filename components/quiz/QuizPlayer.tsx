"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { normalizeAnswer, toText } from "@/lib/i18n/types";
import type { Quiz, QuizQuestion } from "@/lib/quiz/types";

type Props = {
  quiz: Quiz;
  onFinish: (score: number) => void;
};

function isRight(q: QuizQuestion, val: string | number | null): boolean {
  if (val === null || val === "") return false;
  if (q.type === "number") {
    const n = typeof val === "number" ? val : Number(val);
    return Number.isFinite(n) && Math.abs(n - Number(q.answer)) < 0.011;
  }
  const given = normalizeAnswer(String(val));
  const accepted = [q.answer, ...(q.accepts ?? [])].map((a) => normalizeAnswer(String(a)));
  return accepted.includes(given);
}

export function QuizPlayer({ quiz, onFinish }: Props) {
  const { t, locale } = useI18n();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | number | null)[]>(
    () => quiz.questions.map(() => null),
  );
  const [draft, setDraft] = useState("");
  const [locked, setLocked] = useState(false);

  const q = quiz.questions[idx]!;
  const selected = answers[idx];

  function selectChoice(c: string) {
    if (locked) return;
    const next = [...answers];
    next[idx] = c;
    setAnswers(next);
  }

  function check() {
    if (q.type === "mc") {
      if (selected === null) return;
      setLocked(true);
      return;
    }
    if (!draft.trim()) return;
    const next = [...answers];
    next[idx] = q.type === "number" ? Number(draft) : draft;
    setAnswers(next);
    setLocked(true);
  }

  function next() {
    if (idx + 1 >= quiz.questions.length) {
      let score = 0;
      quiz.questions.forEach((qq, i) => {
        if (isRight(qq, answers[i] ?? null)) score += 1;
      });
      onFinish(score);
      return;
    }
    setIdx((i) => i + 1);
    setDraft("");
    setLocked(false);
  }

  const shown = locked ? answers[idx] : q.type === "mc" ? selected : draft;
  const correctNow = locked && isRight(q, answers[idx] ?? null);

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-indigo-700">
          {t("quiz.progress", { current: idx + 1, total: quiz.questions.length })}
        </p>
        <p className="text-xs text-muted">seed {quiz.seed}</p>
      </div>

      {q.passage && (
        <blockquote className="rounded-2xl border-2 border-sky-100 bg-sky-50 p-4 text-base font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
          {toText(q.passage, locale)}
        </blockquote>
      )}

      <p className="text-lg font-semibold text-ink whitespace-pre-wrap">{toText(q.prompt, locale)}</p>

      {q.type === "mc" && q.choices && (
        <div className="grid gap-2">
          {q.choices.map((c) => {
            let cls =
              "rounded-xl border-2 px-4 py-3 text-left font-medium transition ";
            if (!locked) {
              cls +=
                selected === c
                  ? "border-coral bg-coral/10"
                  : "border-line bg-white hover:border-sky-300";
            } else if (c === String(q.answer)) {
              cls += "border-lime-500 bg-lime-50";
            } else if (c === selected) {
              cls += "border-coral bg-coral/15 line-through opacity-80";
            } else {
              cls += "border-line opacity-60";
            }
            return (
              <button
                key={c}
                type="button"
                disabled={locked}
                className={cls}
                onClick={() => selectChoice(c)}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {(q.type === "fill" || q.type === "number") && (
        <input
          type={q.type === "number" ? "number" : "text"}
          step="any"
          value={locked ? String(shown ?? "") : draft}
          disabled={locked}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full max-w-md rounded-xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-sky-400 focus:outline-none"
        />
      )}

      {locked && (
        <div>
          <p className={`font-bold ${correctNow ? "text-lime-700" : "text-coral"}`}>
            {correctNow ? t("common.correct") : t("common.wrong")}
          </p>
          {!correctNow && (
            <p className="text-sm text-muted mt-1">
              {t("common.answer", { answer: String(q.answer) })}
            </p>
          )}
          {q.explanation && (
            <p className="mt-2 text-sm text-ink-soft">
              <span className="font-semibold">{t("common.explanation")}: </span>
              {toText(q.explanation, locale)}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {!locked ? (
          <button
            type="button"
            className="btn-primary"
            disabled={q.type === "mc" ? selected === null : !draft.trim()}
            onClick={check}
          >
            {t("common.check")}
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={next}>
            {idx + 1 >= quiz.questions.length ? t("quiz.finish") : t("common.next")}
          </button>
        )}
      </div>
    </div>
  );
}
