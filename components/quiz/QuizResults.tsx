"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { Quiz } from "@/lib/quiz/types";

type Props = {
  quiz: Quiz;
  score: number;
  onRetry: () => void;
  onRegenerate: () => void;
  onSetup: () => void;
};

export function QuizResults({ quiz, score, onRetry, onRegenerate, onSetup }: Props) {
  const { t } = useI18n();
  const total = quiz.questions.length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const great = pct >= 70;

  return (
    <div className="card space-y-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        {t("quiz.results")}
      </p>
      <h2 className="text-3xl font-black text-ink">{great ? t("quiz.great") : t("quiz.keepGoing")}</h2>
      <p className="text-5xl font-black text-coral">
        {score}/{total}
      </p>
      <p className="text-muted">{pct}%</p>
      <p className="text-xs text-muted">{t("quiz.seed", { seed: quiz.seed })}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-primary" onClick={onRetry}>
          {t("common.retry")}
        </button>
        <button type="button" className="btn-secondary" onClick={onRegenerate}>
          {t("common.regenerate")}
        </button>
        <button type="button" className="btn-ghost" onClick={onSetup}>
          {t("quiz.setupTitle")}
        </button>
      </div>
    </div>
  );
}
