"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import type { DictKey } from "@/lib/i18n/dict";

const LINKS: ReadonlyArray<{ href: string; key: DictKey }> = [
  { href: "/", key: "nav.home" },
  { href: "/subject/chinese", key: "nav.chinese" },
  { href: "/subject/english", key: "nav.english" },
  { href: "/subject/maths", key: "nav.maths" },
  { href: "/quiz", key: "nav.quiz" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t-4 border-sky-100 bg-white/80">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1.5fr]">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold text-indigo-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-lg">
              📚
            </span>
            {t("brand.title")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("footer.blurb")}</p>
        </div>

        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
            {t("footer.links")}
          </p>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-indigo-600 hover:text-coral hover:underline">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <p className="rounded-2xl border-2 border-lime-200 bg-lime-50 px-4 py-3 font-bold text-lime-800">
            ✅ {t("footer.disclaimer")}
          </p>
          <p className="rounded-2xl border-2 border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-800">
            ⚠️ {t("footer.copy")}
          </p>
        </div>
      </div>
      <div className="border-t-2 border-sky-100 py-4 text-center text-xs font-medium text-slate-500">
        {t("brand.title")} · {t("brand.tagline")}
      </div>
    </footer>
  );
}
