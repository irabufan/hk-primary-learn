"use client";

import { Mascot } from "@/components/Mascot";
import { useI18n } from "@/lib/i18n/provider";
import { getSubject } from "@/lib/curriculum";
import type { Quiz } from "@/lib/quiz/types";
import type { QuizSource } from "@/lib/quiz/llm-stub";

type Props = {
  quiz: Quiz;
  score: number;
  source?: QuizSource;
  onRetry: () => void;
  onRegenerate: () => void;
  onSetup: () => void;
};

export function QuizResults({ quiz, score, source, onRetry, onRegenerate, onSetup }: Props) {
  const { t } = useI18n();
  const total = quiz.questions.length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const great = pct >= 70;
  const subject = getSubject(quiz.subject);

  return (
    <div className={`card space-y-5 overflow-hidden text-center ${subject ? `border-2 ${subject.border}` : ""}`}>
      {subject && <div className={`-mx-5 -mt-5 mb-0 h-2 ${subject.accent}`} aria-hidden />}
      <div className="flex justify-center pt-1">
        <Mascot className="h-28 w-28 sm:h-32 sm:w-32" mood={great ? "cheer" : "tryagain"} />
      </div>
      <p className={`text-sm font-semibold uppercase tracking-wide ${subject?.text ?? "text-indigo-600"}`}>
        {t("quiz.resultsTitle")}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-ink">
        {great ? t("score.great") : t("score.good")}
      </h2>
      <p className={`text-5xl font-bold ${subject?.text ?? "text-coral"}`}>
        {score}/{total}
      </p>
      <p className="text-muted">{pct}%</p>
      <p className="text-xs text-muted">seed {quiz.seed}</p>
      {source && (
        <p className="text-xs font-semibold text-slate-500">
          {source === "llm" ? t("quiz.sourceLlm") : t("quiz.sourceMock")}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-base font-bold text-white shadow ${subject?.accent ?? "bg-coral"}`}
          onClick={onRetry}
        >
          {t("quiz.retrySame")}
        </button>
        <button type="button" className="btn-secondary" onClick={onRegenerate}>
          {t("quiz.regenerate")}
        </button>
        <button type="button" className="btn-ghost" onClick={onSetup}>
          {t("quiz.changeSettings")}
        </button>
      </div>
    </div>
  );
}
