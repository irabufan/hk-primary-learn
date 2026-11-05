"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import type { DictKey } from "@/lib/i18n/dict";

const LINKS: ReadonlyArray<{ href: string; key: DictKey }> = [
  { href: "/", key: "nav.home" },
  { href: "/subject/chinese", key: "nav.chinese" },
  { href: "/subject/english", key: "nav.english" },
  { href: "/subject/maths", key: "nav.maths" },
  { href: "/subject/gs", key: "nav.gs" },
  { href: "/quiz", key: "nav.quiz" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-sky-200 bg-white/80">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.5fr_1fr_1.5fr]">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-lg">
              📚
            </span>
            {t("brand.title")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("footer.blurb")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("footer.links")}
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-x-4 text-sm font-medium sm:mt-3 sm:block sm:space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-11 w-full items-center text-base text-indigo-600 hover:text-coral hover:underline sm:min-h-0 sm:text-sm">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <p className="rounded-xl border border-lime-300 bg-lime-50 px-4 py-3 font-medium text-lime-900">
            ✅ {t("footer.disclaimer")}
          </p>
          <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-medium text-orange-900">
            ⚠️ {t("footer.copy")}
          </p>
        </div>
      </div>
      <div className="border-t border-sky-100 py-3 text-center text-xs font-medium text-slate-500">
        {t("brand.title")} · {t("brand.tagline")}
      </div>
    </footer>
  );
}
