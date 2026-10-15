"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopicCard } from "@/components/TopicCard";
import { getSubject, isSubjectId, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";

function SubjectInner({ subjectParam }: { subjectParam: string }) {
  const search = useSearchParams();
  const { t, locale } = useI18n();
  const yearParam = search.get("year");
  const year: Year =
    yearParam === "P4" || yearParam === "P5" || yearParam === "P6" ? yearParam : "P4";

  if (!isSubjectId(subjectParam)) {
    return (
      <div className="wrap py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">{t("common.notFound")}</h1>
        <Link href="/" className="btn-primary">
          {t("common.backHome")}
        </Link>
      </div>
    );
  }

  const subject = getSubject(subjectParam)!;
  const name = locale === "zh-HK" ? subject.nameZh : subject.nameEn;

  return (
    <div className="wrap py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">
          ← {t("subject.backSubjects")}
        </Link>
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-800">
          {year}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{subject.emoji}</span>
        <div>
          <h1 className="text-3xl font-black text-ink">{name}</h1>
          <p className="text-muted">{t("subject.hub")}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subject.topics.map((topic) => (
          <TopicCard key={topic.id} subjectId={subject.id} topic={topic} year={year} />
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
