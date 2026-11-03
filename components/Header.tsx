"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useI18n } from "@/lib/i18n/provider";
import type { DictKey } from "@/lib/i18n/dict";

const NAV_LINKS: ReadonlyArray<{ href: string; key: DictKey }> = [
  { href: "/", key: "nav.home" },
  { href: "/subject/chinese", key: "nav.chinese" },
  { href: "/subject/english", key: "nav.english" },
  { href: "/subject/maths", key: "nav.maths" },
  { href: "/subject/gs", key: "nav.gs" },
];

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    // Mobile: compact two-row header that scrolls away (keeps the screen for the lesson);
    // sm+: sticky single row as before.
    <header className="z-40 border-b-4 border-sky-100 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-3 py-2 sm:px-6 sm:py-3">
        <Link href="/" className="group flex min-h-11 items-center gap-2.5 sm:gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 text-xl shadow-sm transition-transform group-hover:rotate-6 sm:h-11 sm:w-11 sm:text-2xl">
            📚
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-indigo-700 sm:text-lg">{t("brand.title")}</span>
            <span className="hidden text-xs font-semibold text-slate-500 sm:block">{t("brand.tagline")}</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:order-last sm:gap-x-4">
          <Link
            href="/quiz"
            className={`hidden min-h-11 items-center rounded-full px-4 text-sm font-extrabold shadow transition hover:-translate-y-0.5 sm:inline-flex ${
              pathname === "/quiz"
                ? "bg-coral text-white"
                : "bg-gradient-to-r from-orange-400 to-coral text-white"
            }`}
          >
            🎯 {t("nav.quiz")}
          </Link>
          <LocaleToggle />
        </div>

        <div className="w-full sm:ml-auto sm:w-auto">
          <nav aria-label={t("nav.home")}>
            <ul className="grid grid-cols-6 gap-1 text-sm font-bold sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex min-h-11 items-center justify-center rounded-full px-2 transition sm:px-3.5 ${
                        active
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-600 hover:bg-sky-50 hover:text-indigo-700"
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                );
              })}
              {/* Phones: the quiz link sits in the nav grid (sm+ shows the pill button instead). */}
              <li className="sm:hidden">
                <Link
                  href="/quiz"
                  className={`flex min-h-11 items-center justify-center rounded-full px-1 font-extrabold text-white shadow ${
                    pathname === "/quiz" ? "bg-coral" : "bg-gradient-to-r from-orange-400 to-coral"
                  }`}
                >
                  {t("nav.quiz")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
