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
    <div className="space-y-8">
      {/* Hero — flat bright block, no sky gradient */}
      <section className="animate-pop-in rounded-3xl border-2 border-sky-200 bg-sky-100 p-6 sm:p-9">
        <p className="inline-block rounded-full bg-white px-3.5 py-1 text-sm font-semibold text-sky-800 shadow-sm">
          🇭🇰 {t("home.badge")}
        </p>
        <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {t("home.lead")}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/quiz"
            className="inline-block rounded-full bg-coral px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105"
          >
            🎯 {t("home.ctaQuiz")}
          </Link>
          <a
            href="#subjects"
            className="inline-block rounded-full border-2 border-sky-300 bg-white px-6 py-3.5 text-base font-semibold text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50"
          >
            📚 {t("home.ctaSubjects")}
          </a>
          <span className="ml-auto hidden sm:block">
            <LocaleToggle />
          </span>
        </div>
      </section>

      {/* Year picker — soft inset panel, not a heavy card */}
      <section className="rounded-2xl bg-white/80 px-4 py-4 sm:px-5 sm:py-5">
        <YearPicker value={year} onChange={handleYearChange} note />
      </section>

      {/* Subjects */}
      <section id="subjects" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {t("home.subjectsTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("home.subjectsLead")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} year={year} />
          ))}
        </div>
      </section>

      {/* How it works — numbered strips, lighter than subject cards */}
      <section>
        <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{t("home.howTitle")}</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              ["1️⃣", "home.step1.title", "home.step1.body"],
              ["2️⃣", "home.step2.title", "home.step2.body"],
              ["3️⃣", "home.step3.title", "home.step3.body"],
            ] as const
          ).map(([icon, titleKey, bodyKey]) => (
            <li
              key={titleKey}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                {icon}
              </span>
              <h3 className="mt-2 text-base font-bold text-ink">{t(titleKey)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{t(bodyKey)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recent practice */}
      {progress !== null && (
        <section className="rounded-2xl border border-lime-300 bg-lime-50 px-5 py-4">
          <h2 className="text-lg font-bold text-lime-900">{t("home.activity")}</h2>
          {progress.length === 0 ? (
            <p className="mt-1.5 text-sm text-slate-600">{t("home.activityNone")}</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {progress.map((entry) => {
                const subject = getSubject(entry.subject);
                const topic = subject ? subject.topics.find((topic) => topic.slug === entry.topic) : undefined;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-2 rounded-full border border-lime-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
                  >
                    <span aria-hidden>{entry.kind === "quiz" ? "🎯" : "✏️"}</span>
                    <span>{t(entry.kind === "quiz" ? "storage.quiz" : "storage.exercise")}</span>
                    <span className="text-slate-400">·</span>
                    <span>{topic ? toText(topic.name, locale) : entry.topic}</span>
                    <span className="rounded-full bg-lime-200/80 px-2 py-0.5 text-xs font-semibold text-lime-900">
                      {entry.score}/{entry.total}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Quiz banner — flat bright coral, no purple gradient */}
      <section className="rounded-3xl bg-coral p-6 text-white shadow-md sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">🎯 {t("home.quizBannerTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-orange-50 sm:text-base">
          {t("home.quizBannerBody")}
        </p>
        <Link
          href={quizPath("chinese", undefined, year)}
          className="mt-5 inline-block rounded-full bg-white px-6 py-3.5 text-base font-bold text-coral shadow transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          {t("home.quizBannerCta")} →
        </Link>
      </section>
    </div>
  );
}
