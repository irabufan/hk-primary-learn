"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import { subjectPath } from "@/lib/curriculum";
import type { Subject, Year } from "@/lib/curriculum";

type SubjectCardProps = {
  subject: Subject;
  year: Year;
};

/** Bright gradient card linking to a subject hub (carries the picked year). */
export function SubjectCard({ subject, year }: SubjectCardProps) {
  const { locale, t } = useI18n();

  return (
    <Link
      href={subjectPath(subject.slug, year)}
      className={`group block rounded-3xl border-4 border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${subject.ring}`}
    >
      <div
        className={`mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-4xl shadow-inner transition-transform group-hover:rotate-6 ${subject.gradient}`}
      >
        {subject.icon}
      </div>
      <h3 className="text-xl font-extrabold text-indigo-800">
        {toText(subject.name, "zh-HK")} · {toText(subject.name, "en")}
      </h3>
      <p className="mt-1 text-sm font-semibold text-slate-600">{toText(subject.tagline, locale)}</p>
      <ul className="mt-4 space-y-1.5">
        {subject.topics.map((topic) => (
          <li key={topic.slug} className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span aria-hidden>{topic.icon}</span>
            {toText(topic.name, locale)}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${subject.soft}`}
        >
          {t("hub.topics", { n: subject.topics.length })}
        </span>
        <span className="text-sm font-extrabold text-indigo-600 transition-all group-hover:-translate-y-0.5">
          {t("common.start")} →
        </span>
      </div>
    </Link>
  );
}
