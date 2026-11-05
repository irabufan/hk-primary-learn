"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopicCard } from "@/components/TopicCard";
import { getSubject, isSubjectSlug, isYear, topicsForYear, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";

function SubjectInner({ subjectParam }: { subjectParam: string }) {
  const search = useSearchParams();
  const { t, locale } = useI18n();
  const yearParam = search.get("year");
  const year: Year =
    yearParam && isYear(yearParam) ? yearParam : "P4";

  if (!isSubjectSlug(subjectParam)) {
    return (
      <div className="wrap space-y-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("hub.back")}</h1>
        <Link href="/" className="btn-primary">
          {t("nav.home")}
        </Link>
      </div>
    );
  }

  const subject = getSubject(subjectParam)!;

  return (
    <div className="wrap space-y-5 py-4 sm:py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 hover:underline">
          ← {t("hub.back")}
        </Link>
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${subject.soft}`}>
          {year}
        </span>
      </div>
      <div className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${subject.border}`}>
        <div className={`h-2 w-full ${subject.accent}`} aria-hidden />
        <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <span className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl text-white ${subject.accent}`}>
            {subject.icon}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{toText(subject.name, locale)}</h1>
            <p className="text-sm text-muted">{t("hub.pick")}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topicsForYear(subject, year).map((topic) => (
          <TopicCard key={topic.slug} subject={subject} topic={topic} year={year} />
        ))}
      </div>
    </div>
  );
}

export default function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = use(params);
  return (
    <Suspense fallback={<div className="wrap py-16 text-muted">…</div>}>
      <SubjectInner subjectParam={subject} />
    </Suspense>
  );
}
