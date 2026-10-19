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
    <header className="sticky top-0 z-40 border-b-4 border-sky-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 text-2xl shadow-sm transition-transform group-hover:rotate-6">
            📚
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-indigo-700">{t("brand.title")}</span>
            <span className="block text-xs font-semibold text-slate-500">{t("brand.tagline")}</span>
          </span>
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <nav aria-label={t("nav.home")}>
            <ul className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`inline-block rounded-full px-3.5 py-2 transition ${
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
            </ul>
          </nav>
          <Link
            href="/quiz"
            className={`inline-block rounded-full px-4 py-2 text-sm font-extrabold shadow transition hover:-translate-y-0.5 ${
              pathname === "/quiz"
                ? "bg-coral text-white"
                : "bg-gradient-to-r from-orange-400 to-coral text-white"
            }`}
          >
            🎯 {t("nav.quiz")}
          </Link>
          <LocaleToggle />
        </div>
      </div>
    </header>
  );
}
