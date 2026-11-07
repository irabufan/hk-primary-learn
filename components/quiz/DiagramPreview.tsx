"use client";

import { useState } from "react";
import { Mascot } from "@/components/Mascot";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { diagramPreviewQuiz } from "@/lib/quiz/diagram-examples";
import { useI18n } from "@/lib/i18n/provider";

const QUIZ = diagramPreviewQuiz();

export function DiagramPreview() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = QUIZ.questions.length;
  const great = score / total >= 0.7;

  return (
    <div className="space-y-5" data-testid="diagram-preview">
      <section className="rounded-3xl border-2 border-orange-200 bg-orange-50 p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-orange-900">
              {t("preview.kicker")}
            </p>
            <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t("preview.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {t("preview.lead")}
            </p>
          </div>
          <Mascot className="hidden h-24 w-24 shrink-0 sm:block" mood="read" />
        </div>
      </section>

      {phase === "play" ? (
        <QuizPlayer
          key={round}
          quiz={QUIZ}
          banner={t("preview.kicker")}
          onFinish={(next) => {
            setScore(next);
            setPhase("done");
          }}
        />
      ) : (
        <div className="card space-y-4 border-2 border-orange-500 text-center">
          <div className="-mx-5 -mt-5 h-2 bg-orange-600" aria-hidden />
          <div className="flex justify-center pt-1">
            <Mascot className="h-28 w-28" mood={great ? "cheer" : "tryagain"} />
          </div>
          <h2 className="text-2xl font-bold text-ink">{t("preview.done")}</h2>
          <p className="text-5xl font-bold text-orange-700">
            {score}/{total}
          </p>
          <p className="text-sm leading-relaxed text-slate-600">{t("preview.doneNote")}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setPhase("play");
              setRound((value) => value + 1);
            }}
          >
            {t("preview.restart")}
          </button>
        </div>
      )}
    </div>
  );
}
