"use client";

import { Suspense, use, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FillBlank } from "@/components/exercises/FillBlank";
import { MatchPairs } from "@/components/exercises/MatchPairs";
import { MultipleChoice } from "@/components/exercises/MultipleChoice";
import { NumberInput } from "@/components/exercises/NumberInput";
import { getTopic, isSubjectId, type Year } from "@/lib/curriculum";
import { getExercise } from "@/lib/exercises/content";
import { useI18n } from "@/lib/i18n/provider";
import { recordProgress } from "@/lib/storage";

function ExerciseInner({
  subjectParam,
  topicParam,
}: {
  subjectParam: string;
  topicParam: string;
}) {
  const search = useSearchParams();
  const { t, locale } = useI18n();
  const yearParam = search.get("year");
  const year: Year =
    yearParam === "P4" || yearParam === "P5" || yearParam === "P6" ? yearParam : "P4";

  const [done, setDone] = useState<{ score: number; total: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const valid = isSubjectId(subjectParam);
  const topicMeta = valid ? getTopic(subjectParam, topicParam) : undefined;
  const exercise = valid ? getExercise(subjectParam, topicParam) : null;

  const title = useMemo(() => {
    if (!exercise) return "";
    return locale === "zh-HK" ? exercise.titleZh : exercise.titleEn;
  }, [exercise, locale]);

  const onComplete = useCallback(
    (score: number, total: number) => {
      setDone({ score, total });
      if (valid) recordProgress(subjectParam, topicParam, total ? score / total : 0);
    },
    [subjectParam, topicParam, valid],
  );

  if (!valid || !topicMeta || !exercise) {
    return (
      <div className="wrap py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">{t("common.notFound")}</h1>
        <Link href="/" className="btn-primary">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  const topicName = locale === "zh-HK" ? topicMeta.nameZh : topicMeta.nameEn;

  return (
    <div className="wrap py-8 space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/subject/${subjectParam}?year=${year}`}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← {t("exercise.backTopic")}
        </Link>
        <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-800">
          {year}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-coral">{t("exercise.title")}</p>
        <h1 className="text-2xl font-black text-ink">
          {topicMeta.emoji} {topicName}
        </h1>
        <p className="text-muted">{title}</p>
      </div>

      {done ? (
        <div className="card space-y-4 text-center">
          <h2 className="text-2xl font-black">{t("exercise.complete")}</h2>
          <p className="text-3xl font-black text-coral">
            {t("exercise.yourScore", { score: done.score, total: done.total })}
          </p>
          <p className="text-xs text-muted">{t("common.progress")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setDone(null);
                setResetKey((k) => k + 1);
              }}
            >
              {t("exercise.tryAgain")}
            </button>
            <Link
              href={`/quiz?subject=${subjectParam}&topic=${topicParam}&year=${year}`}
              className="btn-secondary"
            >
              {t("common.quiz")}
            </Link>
            <Link href={`/subject/${subjectParam}?year=${year}`} className="btn-ghost">
              {t("exercise.backTopic")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" key={resetKey}>
          {exercise.type === "match" && (
            <MatchPairs items={exercise.items} onComplete={onComplete} />
          )}
          {exercise.type === "fill" && (
            <FillBlank items={exercise.items} onComplete={onComplete} />
          )}
          {exercise.type === "mc" && (
            <MultipleChoice items={exercise.items} onComplete={onComplete} />
          )}
          {exercise.type === "number" && (
            <NumberInput items={exercise.items} onComplete={onComplete} />
          )}
        </div>
      )}
    </div>
  );
}

export default function ExercisePage({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}) {
  const { subject, topic } = use(params);
  return (
    <Suspense fallback={<div className="wrap py-16 text-muted">…</div>}>
      <ExerciseInner subjectParam={subject} topicParam={topic} />
    </Suspense>
  );
}
