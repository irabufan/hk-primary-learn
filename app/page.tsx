"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LocaleToggle } from "@/components/LocaleToggle";
import { SubjectCard } from "@/components/SubjectCard";
import { YearPicker } from "@/components/YearPicker";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import { DEFAULT_YEAR, getSubject, quizPath, SUBJECTS } from "@/lib/curriculum";
import type { Year } from "@/lib/curriculum";
import { getProgress, getStoredYear, setStoredYear } from "@/lib/storage";

export default function HomePage() {
  const { locale, t } = useI18n();
  const [year, setYear] = useState<Year>(DEFAULT_YEAR);
  const [progress, setProgress] = useState<ReturnType<typeof getProgress> | null>(null);

  useEffect(() => {
    const stored = getStoredYear();
    if (stored) setYear(stored);
    setProgress(getProgress().slice(0, 5));
  }, []);

  const handleYearChange = (next: Year) => {
    setYear(next);
    setStoredYear(next);
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="animate-pop-in rounded-3xl border-4 border-white bg-gradient-to-br from-sky-100 via-sky-50 to-white p-6 shadow-sm sm:p-10">
        <p className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-extrabold text-indigo-700 shadow-sm">
          🇭🇰 {t("home.badge")}
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-indigo-800 sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
          {t("home.lead")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/quiz"
            className="inline-block rounded-full bg-gradient-to-r from-orange-400 to-coral px-6 py-3.5 text-base font-extrabold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            🎯 {t("home.ctaQuiz")}
          </Link>
          <a
            href="#subjects"
            className="inline-block rounded-full border-2 border-indigo-200 bg-white px-6 py-3.5 text-base font-extrabold text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50"
          >
            📚 {t("home.ctaSubjects")}
          </a>
          <span className="ml-auto hidden sm:block">
            <LocaleToggle />
          </span>
        </div>
      </section>

      {/* Year picker */}
      <section className="rounded-3xl border-4 border-sky-100 bg-white p-6 shadow-sm">
        <YearPicker value={year} onChange={handleYearChange} note />
      </section>

      {/* Subjects */}
      <section id="subjects" className="scroll-mt-24">
        <h2 className="text-2xl font-extrabold text-indigo-800 sm:text-3xl">
          {t("home.subjectsTitle")}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">{t("home.subjectsLead")}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} year={year} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-extrabold text-indigo-800 sm:text-3xl">{t("home.howTitle")}</h2>
        <ol className="mt-5 grid gap-5 sm:grid-cols-3">
          {(
            [
              ["1️⃣", "home.step1.title", "home.step1.body"],
              ["2️⃣", "home.step2.title", "home.step2.body"],
              ["3️⃣", "home.step3.title", "home.step3.body"],
            ] as const
          ).map(([icon, titleKey, bodyKey]) => (
            <li key={titleKey} className="rounded-3xl border-4 border-sky-100 bg-white p-6 shadow-sm">
              <span className="text-3xl" aria-hidden>
                {icon}
              </span>
              <h3 className="mt-3 text-lg font-extrabold text-indigo-800">{t(titleKey)}</h3>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{t(bodyKey)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recent practice (localStorage) */}
      {progress !== null && (
        <section className="rounded-3xl border-4 border-lime-200 bg-lime-50/60 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-lime-800">{t("home.activity")}</h2>
          {progress.length === 0 ? (
            <p className="mt-2 text-sm font-semibold text-slate-600">{t("home.activityNone")}</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {progress.map((entry) => {
                const subject = getSubject(entry.subject);
                const topic = subject ? subject.topics.find((topic) => topic.slug === entry.topic) : undefined;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-2 rounded-full border-2 border-lime-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
                  >
                    <span aria-hidden>{entry.kind === "quiz" ? "🎯" : "✏️"}</span>
                    <span>{t(entry.kind === "quiz" ? "storage.quiz" : "storage.exercise")}</span>
                    <span className="text-slate-400">·</span>
                    <span>{topic ? toText(topic.name, locale) : entry.topic}</span>
                    <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-lime-800">
                      {entry.score}/{entry.total}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Quiz banner */}
      <section className="rounded-3xl border-4 border-indigo-300 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 p-6 shadow-md sm:p-8">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">🎯 {t("home.quizBannerTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-indigo-100 sm:text-base">
          {t("home.quizBannerBody")}
        </p>
        <Link
          href={quizPath("chinese", undefined, year)}
          className="mt-5 inline-block rounded-full bg-white px-6 py-3.5 text-base font-extrabold text-indigo-700 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          {t("home.quizBannerCta")} →
        </Link>
      </section>
    </div>
  );
}
