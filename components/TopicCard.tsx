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

/** Topic card with subject-coloured primary CTA. */
export function TopicCard({ subject, topic, year }: TopicCardProps) {
  const { locale, t } = useI18n();

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition hover:shadow-md ${subject.border}`}>
      <div className={`h-1.5 w-full ${subject.accent}`} aria-hidden />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-xl text-2xl text-white ${subject.accent}`}>
            {topic.icon}
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${subject.soft}`}>
            {t(`kind.${topic.exerciseKind}`)}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold tracking-tight text-ink">
          {toText(topic.name, "zh-HK")} · {toText(topic.name, "en")}
        </h3>
        <p className="mt-1 grow text-sm leading-relaxed text-slate-600">
          {toText(topic.blurb, locale)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={exercisePath(subject.slug, topic.slug, year)}
            className={`inline-block rounded-full px-5 py-2.5 text-sm font-bold text-white shadow transition hover:-translate-y-0.5 ${subject.accent}`}
          >
            {t("hub.exercise")} →
          </Link>
          <Link
            href={quizPath(subject.slug, topic.slug, year)}
            className={`inline-block rounded-full border-2 bg-white px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${subject.border} ${subject.text}`}
          >
            🎯 {t("hub.quiz")}
          </Link>
        </div>
      </div>
    </article>
  );
}
