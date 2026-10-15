"use client";

import Link from "next/link";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useI18n } from "@/lib/i18n/provider";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-800/20 bg-indigo-700 text-white shadow-md">
      <div className="wrap flex h-14 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-sm">
            粵
          </span>
          <span className="hidden sm:inline">HK Learn</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {t("demo")}
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/" className="hover:text-amber-200 transition">
            {t("nav.home")}
          </Link>
          <Link href="/quiz" className="hover:text-amber-200 transition">
            {t("nav.quiz")}
          </Link>
          <LocaleToggle />
        </nav>
      </div>
    </header>
  );
}
