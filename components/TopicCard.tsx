"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import { exercisePath, quizPath } from "@/lib/curriculum";
import type { Subject, Topic, Year } from "@/lib/curriculum";

type TopicCardProps = {
  subject: Subject;
  topic: Topic;
  year: Year;
};

/** Topic card with a link to the exercise and a button to generate a quiz. */
export function TopicCard({ subject, topic, year }: TopicCardProps) {
  const { locale, t } = useI18n();

  return (
    <article className="flex flex-col rounded-3xl border-4 border-sky-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-3xl">
          {topic.icon}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
          {t(`kind.${topic.exerciseKind}`)}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-extrabold text-indigo-800">
        {toText(topic.name, "zh-HK")} · {toText(topic.name, "en")}
      </h3>
      <p className="mt-1 grow text-sm font-semibold leading-relaxed text-slate-600">
        {toText(topic.blurb, locale)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={exercisePath(subject.slug, topic.slug, year)}
          className={`inline-block rounded-full bg-gradient-to-r px-5 py-3 text-sm font-extrabold text-white shadow transition hover:-translate-y-0.5 ${subject.gradient}`}
        >
          {t("hub.exercise")} →
        </Link>
        <Link
          href={quizPath(subject.slug, topic.slug, year)}
          className="inline-block rounded-full border-2 border-indigo-200 bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50"
        >
          🎯 {t("hub.quiz")}
        </Link>
      </div>
    </article>
  );
}
