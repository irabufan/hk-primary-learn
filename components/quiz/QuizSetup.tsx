"use client";

import { useMemo, useState } from "react";
import { SUBJECTS, YEARS, type SubjectSlug, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";

type Props = {
  initialSubject?: SubjectSlug;
  initialTopic?: string;
  initialYear?: Year;
  busy?: boolean;
  onGenerate: (opts: {
    subject: SubjectSlug;
    topic: string;
    year: Year;
    count: number;
  }) => void;
};

export function QuizSetup({
  initialSubject,
  initialTopic,
  initialYear,
  busy,
  onGenerate,
}: Props) {
  const { t, locale } = useI18n();
  const [subject, setSubject] = useState<SubjectSlug>(initialSubject ?? "chinese");
  const topics = useMemo(
    () => SUBJECTS.find((s) => s.slug === subject)?.topics ?? [],
    [subject],
  );
  const [topic, setTopic] = useState(initialTopic ?? topics[0]?.slug ?? "vocab");
  const [year, setYear] = useState<Year>(initialYear ?? "P4");
  const [count, setCount] = useState(5);

  function onSubjectChange(slug: SubjectSlug) {
    setSubject(slug);
    const first = SUBJECTS.find((s) => s.slug === slug)?.topics[0]?.slug;
    if (first) setTopic(first);
  }

  return (
    <div className="card space-y-5">
      <div>
        <h2 className="text-xl font-bold text-indigo-900">{t("quiz.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("quiz.lead")}</p>
        <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
          {t("quiz.badge")}
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("quiz.subject")}</span>
        <select
          className="select"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value as SubjectSlug)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {toText(s.name, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("quiz.topic")}</span>
        <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((tp) => (
            <option key={tp.slug} value={tp.slug}>
              {toText(tp.name, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("quiz.year")}</span>
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                year === y
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-line text-ink-soft hover:border-indigo-300"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("quiz.count")}</span>
        <div className="flex flex-wrap gap-2">
          {[5, 8, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                count === n
                  ? "bg-coral text-white"
                  : "bg-white border border-line text-ink-soft hover:border-coral/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </label>

      <button
        type="button"
        disabled={busy}
        className="btn-primary w-full sm:w-auto"
        onClick={() => onGenerate({ subject, topic, year, count })}
      >
        {busy ? t("quiz.generating") : t("quiz.generate")}
      </button>
    </div>
  );
}
