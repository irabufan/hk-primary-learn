"use client";

import { useI18n } from "@/lib/i18n/provider";

/** EN | 繁體 segmented toggle — persists to localStorage via the provider. */
export function LocaleToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("locale.aria")}
      className="inline-flex rounded-full border-2 border-sky-100 bg-white p-1 shadow-sm"
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        className={`min-w-[3.5rem] rounded-full px-3 py-1.5 text-sm font-extrabold transition ${
          locale === "en"
            ? "bg-indigo-600 text-white shadow"
            : "text-slate-500 hover:bg-sky-50 hover:text-indigo-700"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === "zh-HK"}
        onClick={() => setLocale("zh-HK")}
        className={`min-w-[3.5rem] rounded-full px-3 py-1.5 text-sm font-extrabold transition ${
          locale === "zh-HK"
            ? "bg-indigo-600 text-white shadow"
            : "text-slate-500 hover:bg-sky-50 hover:text-indigo-700"
        }`}
      >
        繁體
      </button>
    </div>
  );
}
