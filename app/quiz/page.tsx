"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { isSubjectSlug, type SubjectSlug, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import { createQuizGenerator, type QuizSource, type QuizWithSource } from "@/lib/quiz/llm-stub";
import type { Quiz } from "@/lib/quiz/types";
import { randomSeed } from "@/lib/rng";
import { addProgress } from "@/lib/storage";

type Phase = "setup" | "play" | "results";

function QuizPageInner() {
  const search = useSearchParams();
  const { t } = useI18n();
  const sub = search.get("subject");
  const top = search.get("topic") ?? undefined;
  const yr = search.get("year");
  const initialSubject: SubjectSlug | undefined =
    sub && isSubjectSlug(sub) ? sub : undefined;
  const initialYear: Year | undefined =
    yr === "P4" || yr === "P5" || yr === "P6" ? yr : undefined;

  const [phase, setPhase] = useState<Phase>("setup");
  const [busy, setBusy] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [source, setSource] = useState<QuizSource | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const [lastOpts, setLastOpts] = useState<{
    subject: SubjectSlug;
    topic: string;
    year: Year;
    count: number;
  } | null>(null);

  const generate = useCallback(
    async (
      opts: { subject: SubjectSlug; topic: string; year: Year; count: number },
      seed?: number,
    ) => {
      setBusy(true);
      setLastOpts(opts);
      try {
        const gen = createQuizGenerator();
        const q = (await gen.generate({
          ...opts,
          seed: seed ?? randomSeed(),
        })) as QuizWithSource;
        setQuiz(q);
        setSource(q.source);
        setPlayKey((k) => k + 1);
        setPhase("play");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  function onFinish(s: number) {
    setScore(s);
    setPhase("results");
    if (quiz) {
      addProgress({
        kind: "quiz",
        subject: quiz.subject,
        topic: quiz.topic,
        score: s,
        total: quiz.questions.length,
      });
    }
  }

  return (
    <div className="wrap py-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-ink">{t("quiz.title")}</h1>
        {source && phase !== "setup" && (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {source === "llm" ? t("quiz.sourceLlm") : t("quiz.sourceMock")}
          </p>
        )}
      </div>

      {phase === "setup" && (
        <QuizSetup
          initialSubject={initialSubject}
          initialTopic={top}
          initialYear={initialYear}
          busy={busy}
          onGenerate={(opts) => void generate(opts)}
        />
      )}

      {phase === "play" && quiz && (
        <QuizPlayer key={`${quiz.id}-${playKey}`} quiz={quiz} onFinish={(s) => onFinish(s)} />
      )}

      {phase === "results" && quiz && (
        <QuizResults
          quiz={quiz}
          score={score}
          source={source}
          onRetry={() => {
            setPlayKey((k) => k + 1);
            setPhase("play");
          }}
          onRegenerate={() => {
            if (lastOpts) void generate(lastOpts, randomSeed());
          }}
          onSetup={() => {
            setPhase("setup");
            setQuiz(null);
            setSource(undefined);
          }}
        />
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="wrap py-16 text-muted">…</div>}>
      <QuizPageInner />
    </Suspense>
  );
}
