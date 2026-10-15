"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { isSubjectId, type SubjectId, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import { createQuizGenerator } from "@/lib/quiz/llm-stub";
import type { Quiz } from "@/lib/quiz/types";
import { randomSeed } from "@/lib/rng";
import { recordProgress } from "@/lib/storage";

type Phase = "setup" | "play" | "results";

function QuizPageInner() {
  const search = useSearchParams();
  const { t } = useI18n();
  const sub = search.get("subject");
  const top = search.get("topic") ?? undefined;
  const yr = search.get("year");
  const initialSubject: SubjectId | undefined = sub && isSubjectId(sub) ? sub : undefined;
  const initialYear: Year | undefined =
    yr === "P4" || yr === "P5" || yr === "P6" ? yr : undefined;

  const [phase, setPhase] = useState<Phase>("setup");
  const [busy, setBusy] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [score, setScore] = useState(0);
  const [lastOpts, setLastOpts] = useState<{
    subject: SubjectId;
    topic: string;
    year: Year;
    count: number;
  } | null>(null);

  const generate = useCallback(
    async (opts: { subject: SubjectId; topic: string; year: Year; count: number }, seed?: number) => {
      setBusy(true);
      setLastOpts(opts);
      try {
        const gen = createQuizGenerator();
        const q = await gen.generate({ ...opts, seed: seed ?? randomSeed() });
        setQuiz(q);
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
      recordProgress(quiz.subject, quiz.topic, quiz.questions.length ? s / quiz.questions.length : 0);
    }
  }

  return (
    <div className="wrap py-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-ink">{t("quiz.setupTitle")}</h1>
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
        <QuizPlayer
          key={quiz.id}
          quiz={quiz}
          onFinish={(s) => onFinish(s)}
        />
      )}

      {phase === "results" && quiz && (
        <QuizResults
          quiz={quiz}
          score={score}
          onRetry={() => setPhase("play")}
          onRegenerate={() => {
            if (lastOpts) void generate(lastOpts, randomSeed());
          }}
          onSetup={() => {
            setPhase("setup");
            setQuiz(null);
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
