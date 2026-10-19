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
        className="inline-flex flex-wrap rounded-2xl border-4 border-sky-100 bg-white p-1.5 shadow-sm"
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
              className={`min-w-[3.25rem] sm:min-w-[4rem] rounded-xl px-4 py-2.5 text-base sm:text-lg font-extrabold transition ${
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
