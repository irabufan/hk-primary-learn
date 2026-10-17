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
        <p className="text-sm font-extrabold text-indigo-700">
          {t("quiz.progress", { current: idx + 1, total: quiz.questions.length })}
        </p>
        <p className="text-xs font-semibold text-muted">seed {quiz.seed}</p>
      </div>

      {q.passage && (
        <blockquote className="rounded-2xl border-2 border-sky-100 bg-sky-50 p-4 text-base font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
          {toText(q.passage, locale)}
        </blockquote>
      )}

      <p className="text-lg font-extrabold text-ink whitespace-pre-wrap sm:text-xl">
        {toText(q.prompt, locale)}
      </p>

      {q.type === "mc" && q.choices && (
        <ul className="grid gap-2.5">
          {q.choices.map((c, index) => {
            const isSelected = selected === c;
            const isAnswer = locked && c === String(q.answer);
            const isWrongPick = locked && isSelected && c !== String(q.answer);

            let cls =
              "flex w-full min-h-11 items-center gap-3 rounded-2xl border-4 px-4 py-3.5 text-left text-base font-bold transition ";
            if (!locked) {
              cls += isSelected
                ? "border-indigo-500 bg-indigo-50 text-indigo-950 shadow-md ring-2 ring-indigo-200"
                : "border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50";
            } else if (isAnswer) {
              cls += "animate-pop-in border-lime-500 bg-lime-50 text-lime-900";
            } else if (isWrongPick) {
              cls += "animate-shake border-coral bg-orange-50 text-orange-900 line-through";
            } else {
              cls += "border-slate-200 bg-white text-slate-400";
            }

            return (
              <li key={c}>
                <button
                  type="button"
                  disabled={locked}
                  className={cls}
                  onClick={() => selectChoice(c)}
                >
                  <span
                    aria-hidden
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                      isAnswer
                        ? "bg-lime-500 text-white"
                        : isWrongPick
                          ? "bg-coral text-white"
                          : isSelected && !locked
                            ? "bg-indigo-600 text-white"
                            : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {isAnswer ? "✓" : isWrongPick ? "✗" : String.fromCharCode(65 + index)}
                  </span>
                  <span className="leading-relaxed">{c}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {(q.type === "fill" || q.type === "number") && (
        <input
          type={q.type === "number" ? "number" : "text"}
          step="any"
          value={locked ? String(shown ?? "") : draft}
          disabled={locked}
          onChange={(e) => setDraft(e.target.value)}
          className={`w-full max-w-md rounded-2xl border-4 bg-white px-4 py-3 text-lg font-bold text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none ${
            locked
              ? correctNow
                ? "border-lime-500 bg-lime-50"
                : "border-coral bg-orange-50"
              : "border-sky-200"
          }`}
        />
      )}

      {locked && (
        <div
          className={`animate-pop-in rounded-2xl border-4 p-4 ${
            correctNow ? "border-lime-300 bg-lime-50" : "border-orange-300 bg-orange-50"
          }`}
        >
          <p className={`text-base font-extrabold ${correctNow ? "text-lime-800" : "text-orange-800"}`}>
            {correctNow ? `🎉 ${t("common.correct")}` : `💪 ${t("common.wrong")}`}
          </p>
          {!correctNow && (
            <p className="mt-1 text-sm font-bold text-slate-700">
              {t("common.answer", { answer: String(q.answer) })}
            </p>
          )}
          {q.explanation && (
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
              💡 {t("common.explanation")}: {toText(q.explanation, locale)}
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
            {idx + 1 >= quiz.questions.length ? t("quiz.finish") : `${t("common.next")} →`}
          </button>
        )}
      </div>
    </div>
  );
}
