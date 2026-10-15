"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { Quiz, QuizQuestion } from "@/lib/quiz/types";

type Props = {
  quiz: Quiz;
  onFinish: (score: number, answers: (string | number | null)[]) => void;
};

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function isRight(q: QuizQuestion, val: string | number | null): boolean {
  if (val === null || val === "") return false;
  if (q.type === "number") {
    const n = typeof val === "number" ? val : Number(val);
    return Number.isFinite(n) && Math.abs(n - Number(q.answer)) < 0.011;
  }
  return norm(String(val)) === norm(String(q.answer));
}

export function QuizPlayer({ quiz, onFinish }: Props) {
  const { t } = useI18n();
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
      const finalAnswers = answers;
      let score = 0;
      quiz.questions.forEach((qq, i) => {
        if (isRight(qq, finalAnswers[i] ?? null)) score += 1;
      });
      onFinish(score, finalAnswers);
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
          {t("common.question", { n: idx + 1 })} ·{" "}
          {t("common.of", { a: idx + 1, b: quiz.questions.length })}
        </p>
        <p className="text-xs text-muted">{t("quiz.seed", { seed: quiz.seed })}</p>
      </div>
      <p className="text-lg font-semibold text-ink whitespace-pre-wrap">{q.prompt}</p>

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
              {t("quiz.correctAnswer")}: <strong>{String(q.answer)}</strong>
            </p>
          )}
          {q.explanation && (
            <p className="mt-2 text-sm text-ink-soft">
              <span className="font-semibold">{t("common.explanation")}: </span>
              {q.explanation}
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
            {idx + 1 >= quiz.questions.length ? t("common.finish") : t("common.next")}
          </button>
        )}
      </div>
    </div>
  );
}
