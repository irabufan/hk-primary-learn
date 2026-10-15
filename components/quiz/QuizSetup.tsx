"use client";

import { useMemo, useState } from "react";
import { SUBJECTS, YEARS, type SubjectId, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";

type Props = {
  initialSubject?: SubjectId;
  initialTopic?: string;
  initialYear?: Year;
  busy?: boolean;
  onGenerate: (opts: {
    subject: SubjectId;
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
  const [subject, setSubject] = useState<SubjectId>(initialSubject ?? "chinese");
  const topics = useMemo(
    () => SUBJECTS.find((s) => s.id === subject)?.topics ?? [],
    [subject],
  );
  const [topic, setTopic] = useState(initialTopic ?? topics[0]?.id ?? "vocab");
  const [year, setYear] = useState<Year>(initialYear ?? "P4");
  const [count, setCount] = useState(5);

  function onSubjectChange(id: SubjectId) {
    setSubject(id);
    const first = SUBJECTS.find((s) => s.id === id)?.topics[0]?.id;
    if (first) setTopic(first);
  }

  return (
    <div className="card space-y-5">
      <div>
        <h2 className="text-xl font-bold text-indigo-900">{t("quiz.setupTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("quiz.setupLead")}</p>
        <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
          {t("quiz.mockNote")}
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("common.subject")}</span>
        <select
          className="select"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value as SubjectId)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {locale === "zh-HK" ? s.nameZh : s.nameEn}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("common.topic")}</span>
        <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {locale === "zh-HK" ? tp.nameZh : tp.nameEn}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink-soft">{t("common.year")}</span>
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
