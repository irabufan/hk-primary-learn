"use client";

import { YEARS } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import type { Year } from "@/lib/curriculum";

type YearPickerProps = {
  value: Year;
  onChange: (year: Year) => void;
  note?: boolean;
  /** Optional subject accent for the active year chip. */
  accentClass?: string;
};

export function YearPicker({ value, onChange, note = false, accentClass = "bg-slate-800 text-white shadow" }: YearPickerProps) {
  const { t } = useI18n();

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("year.label")}
      </p>
      <div
        role="radiogroup"
        aria-label={t("year.label")}
        className="grid w-full grid-cols-6 gap-0.5 rounded-2xl border-2 border-sky-100 bg-white p-1 sm:inline-flex sm:w-auto sm:flex-wrap sm:gap-0 sm:p-1.5"
      >
        {YEARS.map((year) => {
          const active = value === year;
          return (
            <button
              key={year}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(year)}
              className={`min-h-11 min-w-0 rounded-xl px-0 py-2.5 text-base font-bold transition sm:min-w-[4rem] sm:px-4 sm:text-lg ${
                active
                  ? accentClass
                  : "text-slate-600 hover:bg-sky-50 hover:text-slate-900"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
      {note && <p className="mt-2 text-xs text-slate-500">💾 {t("year.note")}</p>}
    </div>
  );
}
