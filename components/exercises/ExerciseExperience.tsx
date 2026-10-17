"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FillBlank } from "@/components/exercises/FillBlank";
import { MatchPairs, type MatchResult } from "@/components/exercises/MatchPairs";
import { MultipleChoice } from "@/components/exercises/MultipleChoice";
import { NumberInput } from "@/components/exercises/NumberInput";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import { DEFAULT_YEAR, quizPath, subjectPath } from "@/lib/curriculum";
import type { Subject, Topic, Year } from "@/lib/curriculum";
import { getExerciseSession } from "@/lib/exercises";
import type { ExerciseItem } from "@/lib/exercises/types";
import { addProgress } from "@/lib/storage";

type ExerciseExperienceProps = {
  subject: Subject;
  topic: Topic;
  initialYear?: Year;
};

/**
 * Interactive exercise session: plays through the topic's exercise items with
 * instant feedback, then shows a score panel with retry / quiz links.
 */
export function ExerciseExperience({ subject, topic, initialYear }: ExerciseExperienceProps) {
  const { locale, t } = useI18n();
  const year = initialYear ?? DEFAULT_YEAR;

  const [session, setSession] = useState<ExerciseItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const buildSession = () => getExerciseSession(subject.slug, topic.slug, year);

  useEffect(() => {
    setSession(buildSession());
    // A fresh session per mount; year/subject/topic are fixed for the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject.slug, topic.slug, year]);

  if (!session) {
    return (
      <div className="rounded-3xl border-4 border-sky-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-indigo-600" />
        <p className="mt-4 text-base font-bold text-slate-500">{t("exercise.loading")}</p>
      </div>
    );
  }

  const total =
    session.length === 1 && session[0].kind === "match" ? session[0].pairs.length : session.length;
  const score =
    matchResult?.correct ?? results.filter(Boolean).length;

  const finish = (finalScore: number) => {
    setFinished(true);
    addProgress({ kind: "exercise", subject: subject.slug, topic: topic.slug, score: finalScore, total });
  };

  const handleAnswered = (correct: boolean) => {
    setAnswered(true);
    setResults((current) => [...current, correct]);
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    if (nextIndex >= session.length) {
      finish(results.filter(Boolean).length);
      return;
    }
    setIndex(nextIndex);
    setAnswered(false);
  };

  const handleMatchComplete = (result: MatchResult) => {
    setMatchResult(result);
    finish(result.correct);
  };

  const retry = () => {
    setSession(buildSession());
    setIndex(0);
    setResults([]);
    setAnswered(false);
    setFinished(false);
    setMatchResult(null);
  };

  const scoreRatio = total > 0 ? score / total : 0;
  const scoreMessage =
    scoreRatio >= 1
      ? t("score.perfect")
      : scoreRatio >= 0.7
        ? t("score.great")
        : scoreRatio >= 0.5
          ? t("score.good")
          : t("score.again");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={subjectPath(subject.slug, year)}
          className="rounded-full border-2 border-sky-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:border-sky-400 hover:text-indigo-700"
        >
          ← {t("exercise.backToSubject", { subject: toText(subject.name, locale) })}
        </Link>
        <span className={`rounded-full px-4 py-2 text-sm font-extrabold ${subject.soft}`}>
          {subject.icon} {toText(subject.name, locale)}
        </span>
        <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-extrabold text-indigo-700">
          {t("year.badge")}: {year}
        </span>
        <span className="ml-auto rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-600">
          {topic.icon} {toText(topic.name, locale)} · {t(`kind.${topic.exerciseKind}`)}
        </span>
      </div>

      {/* Finished: score panel */}
      {finished ? (
        <section className="animate-pop-in rounded-3xl border-4 border-lime-300 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">{scoreRatio >= 0.7 ? "🎉" : "💪"}</p>
          <h2 className="mt-3 text-2xl font-extrabold text-indigo-800">{t("score.title")}</h2>
          <p className="mt-2 text-xl font-extrabold text-lime-700">
            {t("score.line", { score, total })}
          </p>
          <p className="mt-1 text-base font-bold text-slate-600">{scoreMessage}</p>
          {matchResult && matchResult.misses > 0 && (
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {t("match.misses", { n: matchResult.misses })}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-gradient-to-r from-orange-400 to-coral px-6 py-3 text-base font-extrabold text-white shadow transition hover:-translate-y-0.5"
            >
              🔄 {t("common.retry")}
            </button>
            <Link
              href={quizPath(subject.slug, topic.slug, year)}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-base font-extrabold text-white shadow transition hover:-translate-y-0.5"
            >
              🎯 {t("exercise.makeQuiz")}
            </Link>
          </div>
        </section>
      ) : session.length === 1 && session[0].kind === "match" ? (
        /* Match-pairs topic: the whole board is one question */
        <section className="rounded-3xl border-4 border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-4 text-2xl font-extrabold text-indigo-800">{toText(session[0].title, locale)}</h1>
          <MatchPairs item={session[0]} onComplete={handleMatchComplete} />
        </section>
      ) : (
        /* One-at-a-time questions */
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-indigo-700">
              {t("exercise.progress", { current: index + 1, total })}
            </p>
            <div className="flex flex-wrap gap-1.5" aria-hidden>
              {Array.from({ length: total }, (_, dotIndex) => {
                const result = results[dotIndex];
                const isCurrent = dotIndex === index;
                return (
                  <span
                    key={dotIndex}
                    className={`h-3 w-3 rounded-full transition ${
                      result === true
                        ? "bg-lime-500"
                        : result === false
                          ? "bg-coral"
                          : isCurrent
                            ? "bg-indigo-600 ring-4 ring-indigo-100"
                            : "bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <section className="animate-pop-in rounded-3xl border-4 border-sky-100 bg-white p-6 shadow-sm sm:p-8">
            {(() => {
              const item = session[index];
              if (item.kind === "mc") return <MultipleChoice item={item} onAnswered={handleAnswered} />;
              if (item.kind === "fill") return <FillBlank item={item} onAnswered={handleAnswered} />;
              if (item.kind === "number") return <NumberInput item={item} onAnswered={handleAnswered} />;
              return null;
            })()}
          </section>

          <div className="flex items-center justify-end gap-3">
            {answered && (
              <button
                type="button"
                onClick={handleNext}
                className="animate-pop-in rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-base font-extrabold text-white shadow transition hover:-translate-y-0.5"
              >
                {index + 1 >= session.length ? t("common.finish") : t("common.next")} →
              </button>
            )}
          </div>
        </>
      )}

      <p className="text-center text-xs font-semibold text-slate-400">
        ℹ️ {t("exercise.langNote")}
      </p>
    </div>
  );
}
