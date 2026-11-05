"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import { subjectPath, topicsForYear } from "@/lib/curriculum";
import type { Subject, Year } from "@/lib/curriculum";

type SubjectCardProps = {
  subject: Subject;
  year: Year;
};

/** Subject tile with a fixed flat subject colour. */
export function SubjectCard({ subject, year }: SubjectCardProps) {
  const { locale, t } = useI18n();
  const topics = topicsForYear(subject, year);

  return (
    <Link
      href={subjectPath(subject.slug, year)}
      className={`group block overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${subject.border} ${subject.ring}`}
    >
      <div className={`h-2 w-full ${subject.accent}`} aria-hidden />
      <div className="p-5">
        <div
          className={`mb-3 grid h-14 w-14 place-items-center rounded-2xl text-3xl text-white shadow-inner transition-transform group-hover:rotate-6 ${subject.accent}`}
        >
          {subject.icon}
        </div>
        <h3 className="text-lg font-bold tracking-tight text-ink">
          {toText(subject.name, "zh-HK")} · {toText(subject.name, "en")}
        </h3>
        <p className="mt-1 text-sm text-slate-600">{toText(subject.tagline, locale)}</p>
        <ul className="mt-3 space-y-1">
          {topics.map((topic) => (
            <li key={topic.slug} className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span aria-hidden>{topic.icon}</span>
              {toText(topic.name, locale)}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${subject.soft}`}>
            {t("hub.topics", { n: topics.length })}
          </span>
          <span className={`text-sm font-semibold transition-all group-hover:-translate-y-0.5 ${subject.text}`}>
            {t("common.start")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
