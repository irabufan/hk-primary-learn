"use client";

import { YEARS, type Year } from "@/lib/curriculum";
import { useI18n } from "@/lib/i18n/provider";

type Props = {
  value: Year;
  onChange: (year: Year) => void;
};

export function YearPicker({ value, onChange }: Props) {
  const { t } = useI18n();
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-indigo-800">{t("home.pickYear")}</p>
      <div className="flex flex-wrap gap-2">
        {YEARS.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onChange(y)}
            className={`rounded-2xl px-5 py-3 text-base font-black transition shadow-sm ${
              value === y
                ? "bg-coral text-white scale-[1.02]"
                : "bg-white text-ink border-2 border-line hover:border-coral/40"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
