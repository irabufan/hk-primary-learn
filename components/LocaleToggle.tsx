"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/types";

export function LocaleToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  function select(next: Locale) {
    setLocale(next);
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/30 bg-white/10 p-0.5 text-[12px] font-semibold ${className}`}
      role="group"
      aria-label={t("locale.aria")}
    >
      <button
        type="button"
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "zh-HK" ? "bg-white text-indigo-800 font-bold" : "text-white/80 hover:text-white"
        }`}
        aria-pressed={locale === "zh-HK"}
        onClick={() => select("zh-HK")}
      >
        {t("locale.zh")}
      </button>
      <button
        type="button"
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "en" ? "bg-white text-indigo-800 font-bold" : "text-white/80 hover:text-white"
        }`}
        aria-pressed={locale === "en"}
        onClick={() => select("en")}
      >
        {t("locale.en")}
      </button>
    </div>
  );
}
