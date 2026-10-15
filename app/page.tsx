"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SubjectCard } from "@/components/SubjectCard";
import { YearPicker } from "@/components/YearPicker";
import { SUBJECTS, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import { getStoredYear, setStoredYear } from "@/lib/storage";

export default function HomePage() {
  const { t } = useI18n();
  const [year, setYear] = useState<Year>("P4");

  useEffect(() => {
    const stored = getStoredYear();
    if (stored) setYear(stored);
  }, []);

  function onYear(y: Year) {
    setYear(y);
    setStoredYear(y);
  }

  return (
    <div className="wrap py-10 space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-6 py-10 text-white shadow-xl sm:px-10">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-coral/40 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-amber-300/30 blur-2xl" />
        <p className="relative text-sm font-bold uppercase tracking-wider text-amber-200">
          {t("home.badge")}
        </p>
        <h1 className="relative mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
          {t("home.hero")}
        </h1>
        <p className="relative mt-3 max-w-xl text-base text-indigo-100 sm:text-lg">{t("home.lead")}</p>
        <p className="relative mt-4 text-xs font-medium text-white/70">{t("home.honest")}</p>
      </section>

      <YearPicker value={year} onChange={onYear} />

      <section>
        <h2 className="mb-4 text-lg font-bold text-indigo-900">{t("home.pickSubject")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SUBJECTS.map((s) => (
            <SubjectCard key={s.id} subject={s} year={year} />
          ))}
        </div>
      </section>

      <section className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div>
          <h2 className="text-lg font-bold text-ink">{t("home.quizCta")}</h2>
          <p className="text-sm text-muted">{t("home.quizLead")}</p>
        </div>
        <Link href={`/quiz?year=${year}`} className="btn-primary shrink-0">
          {t("nav.quiz")} →
        </Link>
      </section>
    </div>
  );
}
