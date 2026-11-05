"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HkStripe } from "@/components/HkStripe";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useI18n } from "@/lib/i18n/provider";
import type { DictKey } from "@/lib/i18n/dict";

const NAV_LINKS: ReadonlyArray<{ href: string; key: DictKey; active?: string }> = [
  { href: "/", key: "nav.home", active: "bg-slate-800 text-white shadow" },
  { href: "/subject/chinese", key: "nav.chinese", active: "bg-red-600 text-white shadow" },
  { href: "/subject/english", key: "nav.english", active: "bg-blue-600 text-white shadow" },
  { href: "/subject/maths", key: "nav.maths", active: "bg-orange-600 text-white shadow" },
  { href: "/subject/gs", key: "nav.gs", active: "bg-emerald-600 text-white shadow" },
];

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <header className="z-40 border-b border-sky-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur sm:sticky sm:top-0">
      <HkStripe className="rounded-none" />
      {/*
        Layout: brand + actions on row 1; nav on its own full-width row until lg
        so ~820px tablets aren't cramped. From lg up, nav sits in the middle.
      */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-5 sm:py-2.5 lg:gap-x-5 lg:px-6 lg:py-3">
        <Link href="/" className="group flex min-h-11 items-center gap-2 sm:gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-coral text-lg shadow-sm transition-transform group-hover:rotate-6 sm:h-10 sm:w-10 sm:text-xl lg:h-11 lg:w-11 lg:text-2xl">
            📚
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-ink sm:text-base lg:text-lg">{t("brand.title")}</span>
            <span className="hidden text-xs font-medium text-slate-500 lg:block">{t("brand.tagline")}</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 lg:order-last lg:gap-x-3">
          <Link
            href="/quiz"
            className={`hidden min-h-11 items-center rounded-full px-3.5 text-sm font-bold text-white shadow transition hover:-translate-y-0.5 sm:inline-flex lg:px-4 ${
              pathname === "/quiz" ? "bg-coral" : "bg-coral hover:brightness-105"
            }`}
          >
            🎯 {t("nav.quiz")}
          </Link>
          <LocaleToggle />
        </div>

        <div className="w-full lg:order-none lg:ml-auto lg:w-auto">
          <nav aria-label={t("nav.home")}>
            <ul className="grid grid-cols-6 gap-1 text-sm font-semibold sm:flex sm:flex-wrap sm:items-center sm:gap-1 lg:gap-1.5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                const isHome = link.href === "/";
                const isActive = isHome ? pathname === "/" : active && link.href !== "/";
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex min-h-11 items-center justify-center rounded-full px-1.5 transition sm:px-2.5 lg:px-3.5 ${
                        isActive
                          ? link.active
                          : "text-slate-600 hover:bg-sky-50 hover:text-slate-900"
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                );
              })}
              <li className="sm:hidden">
                <Link
                  href="/quiz"
                  className="flex min-h-11 items-center justify-center rounded-full bg-coral px-1 font-bold text-white shadow"
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
