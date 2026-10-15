"use client";

import Link from "next/link";
import type { SubjectId, Topic, Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";

type Props = {
  subjectId: SubjectId;
  topic: Topic;
  year: Year;
};

export function TopicCard({ subjectId, topic, year }: Props) {
  const { t, locale } = useI18n();
  const name = locale === "zh-HK" ? topic.nameZh : topic.nameEn;
  const blurb = locale === "zh-HK" ? topic.blurbZh : topic.blurbEn;

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{topic.emoji}</span>
        <div>
          <h3 className="text-lg font-bold text-ink">{name}</h3>
          <p className="text-sm text-muted">{blurb}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link
          href={`/exercise/${subjectId}/${topic.id}?year=${year}`}
          className="btn-primary text-sm"
        >
          {t("subject.practice")}
        </Link>
        <Link
          href={`/quiz?subject=${subjectId}&topic=${topic.id}&year=${year}`}
          className="btn-secondary text-sm"
        >
          {t("subject.makeQuiz")}
        </Link>
      </div>
    </div>
  );
}
