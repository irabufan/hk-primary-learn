"use client";

import { useI18n } from "@/lib/i18n/provider";
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

  return (
    <div className="card space-y-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        {t("quiz.resultsTitle")}
      </p>
      <h2 className="text-3xl font-black text-ink">
        {great ? t("score.great") : t("score.good")}
      </h2>
      <p className="text-5xl font-black text-coral">
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
        <button type="button" className="btn-primary" onClick={onRetry}>
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
