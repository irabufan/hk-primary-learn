"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopicCard } from "@/components/TopicCard";
import { getSubject, isSubjectSlug, isYear, type Year } from "@/lib/curriculum";
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
      <div className="wrap py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">{t("hub.back")}</h1>
        <Link href="/" className="btn-primary">
          {t("nav.home")}
        </Link>
      </div>
    );
  }

  const subject = getSubject(subjectParam)!;

  return (
    <div className="wrap py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">
          ← {t("hub.back")}
        </Link>
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-800">
          {year}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{subject.icon}</span>
        <div>
          <h1 className="text-3xl font-black text-ink">{toText(subject.name, locale)}</h1>
          <p className="text-muted">{t("hub.pick")}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subject.topics.map((topic) => (
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
