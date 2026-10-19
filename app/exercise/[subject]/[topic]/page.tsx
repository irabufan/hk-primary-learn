"use client";

import { Suspense, use } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { ExerciseExperience } from "@/components/exercises/ExerciseExperience";
import { getSubject, getTopic, isSubjectSlug, isYear, type Year } from "@/lib/curriculum";

function ExerciseInner({
  subjectParam,
  topicParam,
}: {
  subjectParam: string;
  topicParam: string;
}) {
  const search = useSearchParams();
  const yearParam = search.get("year");
  const year: Year =
    yearParam && isYear(yearParam) ? yearParam : "P4";

  const subject = isSubjectSlug(subjectParam) ? getSubject(subjectParam) : undefined;
  const topic = subject ? getTopic(subject, topicParam) : undefined;

  if (!subject || !topic) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
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
    <Suspense fallback={<div className="mx-auto max-w-2xl py-16 text-center text-slate-400">…</div>}>
      <ExerciseInner subjectParam={subject} topicParam={topic} />
    </Suspense>
  );
}
