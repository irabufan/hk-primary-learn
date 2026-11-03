"use client";

import { YEARS } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";
import type { Year } from "@/lib/curriculum";

type YearPickerProps = {
  value: Year;
  onChange: (year: Year) => void;
  /** Show the "saved in this browser" note under the control. */
  note?: boolean;
};

/** P1–P6 segmented control with big, tappable buttons. */
export function YearPicker({ value, onChange, note = false }: YearPickerProps) {
  const { t } = useI18n();

  return (
    <div>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-500">
        {t("year.label")}
      </p>
      <div
        role="radiogroup"
        aria-label={t("year.label")}
        className="grid w-full grid-cols-6 gap-0.5 rounded-2xl border-4 border-sky-100 bg-white p-1 sm:p-1.5 shadow-sm sm:inline-flex sm:w-auto sm:flex-wrap sm:gap-0"
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
              className={`min-h-11 min-w-0 rounded-xl px-0 py-2.5 sm:min-w-[4rem] sm:px-4 text-base sm:text-lg font-extrabold transition ${
                active
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-600 hover:bg-sky-50 hover:text-indigo-700"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
      {note && <p className="mt-2 text-xs font-semibold text-slate-500">💾 {t("year.note")}</p>}
    </div>
  );
}
