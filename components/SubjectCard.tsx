"use client";

import Link from "next/link";
import type { Subject, Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";

const colorMap: Record<string, string> = {
  coral: "from-orange-400 to-coral",
  sky: "from-sky-400 to-blue-500",
  indigo: "from-indigo-400 to-violet-600",
};

type Props = { subject: Subject; year: Year };

export function SubjectCard({ subject, year }: Props) {
  const { locale } = useI18n();
  const name = locale === "zh-HK" ? subject.nameZh : subject.nameEn;
  const grad = colorMap[subject.color] ?? colorMap.sky;

  return (
    <Link
      href={`/subject/${subject.id}?year=${year}`}
      className="group relative overflow-hidden rounded-3xl bg-white border-2 border-transparent shadow-md transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
    >
      <div className={`h-2 bg-gradient-to-r ${grad}`} />
      <div className="p-5 space-y-2">
        <div className="text-4xl">{subject.emoji}</div>
        <h3 className="text-xl font-black text-ink group-hover:text-indigo-700">{name}</h3>
        <p className="text-sm text-muted">{year} · {subject.topics.length} topics</p>
      </div>
    </Link>
  );
}
