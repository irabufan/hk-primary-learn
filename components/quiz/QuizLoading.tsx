"use client";

import { useI18n } from "@/lib/i18n/provider";

type Props = {
  /** Compact banner (inside setup card) vs full card (regenerate / transition). */
  variant?: "banner" | "card";
};

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block ${className} shrink-0 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin`}
    />
  );
}

export function QuizLoading({ variant = "card" }: Props) {
  const { t } = useI18n();

  if (variant === "banner") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3"
      >
        <Spinner className="mt-0.5 h-5 w-5" />
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-indigo-900">{t("quiz.generating")}</p>
          <p className="mt-0.5 text-xs font-semibold text-indigo-700/80">
            {t("quiz.generatingHint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-5" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Spinner className="h-6 w-6" />
        <div>
          <p className="text-base font-extrabold text-indigo-900">{t("quiz.generating")}</p>
          <p className="mt-0.5 text-sm font-semibold text-muted">{t("quiz.generatingHint")}</p>
        </div>
      </div>
      <div className="space-y-3" aria-hidden>
        <div className="quiz-skeleton h-4 w-1/3" />
        <div className="quiz-skeleton h-24 w-full" />
        <div className="quiz-skeleton h-12 w-full" />
        <div className="quiz-skeleton h-12 w-full" />
        <div className="quiz-skeleton h-12 w-4/5" />
      </div>
    </div>
  );
}

export { Spinner as QuizSpinner };
