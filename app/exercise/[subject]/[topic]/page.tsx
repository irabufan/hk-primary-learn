"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExerciseExperience } from "@/components/exercises/ExerciseExperience";
import { getSubject, getTopic, isSubjectSlug, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";

function ExerciseInner({
  subjectParam,
  topicParam,
}: {
  subjectParam: string;
  topicParam: string;
}) {
  const search = useSearchParams();
  const { t } = useI18n();
  const yearParam = search.get("year");
  const year: Year =
    yearParam === "P4" || yearParam === "P5" || yearParam === "P6" ? yearParam : "P4";

  const subject = isSubjectSlug(subjectParam) ? getSubject(subjectParam) : undefined;
  const topic = subject ? getTopic(subject, topicParam) : undefined;

  if (!subject || !topic) {
    return (
      <div className="wrap py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">{t("hub.back")}</h1>
        <Link href="/" className="btn-primary">
          {t("nav.home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap py-8 space-y-6 max-w-2xl">
      <ExerciseExperience subject={subject} topic={topic} initialYear={year} />
    </div>
  );
}

export default function ExercisePage({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}) {
  const { subject, topic } = use(params);
  return (
    <Suspense fallback={<div className="wrap py-16 text-muted">…</div>}>
      <ExerciseInner subjectParam={subject} topicParam={topic} />
    </Suspense>
  );
}
