"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_YEAR, SUBJECTS, YEARS, type SubjectSlug, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import { QuizLoading, QuizSpinner } from "@/components/quiz/QuizLoading";

type Props = {
  initialSubject?: SubjectSlug;
  initialTopic?: string;
  initialYear?: Year;
  initialCount?: number;
  busy?: boolean;
  onGenerate: (opts: {
    subject: SubjectSlug;
    topic: string;
    year: Year;
    count: number;
  }) => void;
};

const COUNT_OPTIONS = [5, 8, 10] as const;

function resolveCount(value: number | undefined): number {
  if (value && (COUNT_OPTIONS as readonly number[]).includes(value)) return value;
  return 5;
}

export function QuizSetup({
  initialSubject,
  initialTopic,
  initialYear,
  initialCount,
  busy,
  onGenerate,
}: Props) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [subject, setSubject] = useState<SubjectSlug>(initialSubject ?? "chinese");
  const topics = useMemo(
    () => SUBJECTS.find((s) => s.slug === subject)?.topics ?? [],
    [subject],
  );
  const [topic, setTopic] = useState(() => {
    const initialTopics = SUBJECTS.find((s) => s.slug === (initialSubject ?? "chinese"))?.topics ?? [];
    if (initialTopic && initialTopics.some((tp) => tp.slug === initialTopic)) return initialTopic;
    return initialTopics[0]?.slug ?? "vocab";
  });
  const [year, setYear] = useState<Year>(initialYear ?? DEFAULT_YEAR);
  const [count, setCount] = useState(() => resolveCount(initialCount));

  /** Keep address bar in sync without stacking history or remounting the form. */
  const syncUrl = useCallback(
    (next: { subject: SubjectSlug; topic: string; year: Year; count: number }) => {
      const params = new URLSearchParams();
      params.set("subject", next.subject);
      params.set("topic", next.topic);
      params.set("year", next.year);
      params.set("count", String(next.count));
      router.replace(`/quiz?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  function onSubjectChange(slug: SubjectSlug) {
    const first = SUBJECTS.find((s) => s.slug === slug)?.topics[0]?.slug ?? topic;
    setSubject(slug);
    setTopic(first);
    syncUrl({ subject: slug, topic: first, year, count });
  }

  function onTopicChange(nextTopic: string) {
    setTopic(nextTopic);
    syncUrl({ subject, topic: nextTopic, year, count });
  }

  function onYearChange(nextYear: Year) {
    setYear(nextYear);
    syncUrl({ subject, topic, year: nextYear, count });
  }

  function onCountChange(nextCount: number) {
    setCount(nextCount);
    syncUrl({ subject, topic, year, count: nextCount });
  }

  function handleGenerate() {
    const opts = { subject, topic, year, count };
    syncUrl(opts);
    onGenerate(opts);
  }

  return (
    <div className={`card space-y-5 ${busy ? "opacity-95" : ""}`}>
      <div>
        <h2 className="text-xl font-bold text-indigo-900">{t("quiz.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("quiz.lead")}</p>
        <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
          {t("quiz.badge")}
        </p>
      </div>

      {busy && <QuizLoading variant="banner" />}

      <fieldset disabled={busy} className="space-y-5 border-0 p-0 disabled:opacity-60">
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
          <select className="select" value={topic} onChange={(e) => onTopicChange(e.target.value)}>
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
                onClick={() => onYearChange(y)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  year === y
                    ? "min-h-11 bg-indigo-600 text-white shadow"
                    : "min-h-11 bg-white border-2 border-line text-ink-soft hover:border-indigo-400"
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
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onCountChange(n)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  count === n
                    ? "min-h-11 bg-coral text-white shadow"
                    : "min-h-11 bg-white border-2 border-line text-ink-soft hover:border-coral"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </label>
      </fieldset>

      <button
        type="button"
        disabled={busy}
        aria-busy={busy || undefined}
        className="btn-primary w-full sm:w-auto"
        onClick={handleGenerate}
      >
        {busy ? (
          <>
            <QuizSpinner className="h-4 w-4 border-2 border-white/40 border-t-white" />
            {t("quiz.generatingShort")}
          </>
        ) : (
          t("quiz.generate")
        )}
      </button>
    </div>
  );
}
