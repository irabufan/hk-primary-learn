"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, toText } from "@/lib/i18n/types";
import type { NumberItem, OnAnswered } from "@/lib/exercises/types";

type NumberInputProps = {
  item: NumberItem;
  onAnswered?: OnAnswered;
};

/** Type-the-number question with tolerance-based checking. */
export function NumberInput({ item, onAnswered }: NumberInputProps) {
  const { locale, t } = useI18n();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const canSubmit = status === "idle" && value.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const parsed = Number(value.trim());
    const tolerance = item.tolerance ?? 1e-6;
    const correct = Number.isFinite(parsed) && Math.abs(parsed - item.answer) <= tolerance;
    setStatus(correct ? "correct" : "wrong");
    onAnswered?.(correct, value.trim());
  };

  const unit = item.unit ? toText(item.unit, locale) : null;

  return (
    <div>
      <h2 className="text-lg font-extrabold leading-relaxed text-indigo-900 sm:text-xl">
        {toText(item.prompt, locale)}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          disabled={status !== "idle"}
          aria-label={toText(item.prompt, locale)}
          autoComplete="off"
          autoFocus
          className={`w-40 rounded-2xl border-4 px-4 py-3 text-center text-2xl font-extrabold text-slate-800 shadow-sm outline-none transition focus:border-sky-400 ${
            status === "correct"
              ? "border-lime-500 bg-lime-50"
              : status === "wrong"
                ? "animate-shake border-coral bg-orange-50"
                : "border-sky-200 bg-white"
          } ${status !== "idle" ? "cursor-default" : ""}`}
        />
        {unit && <span className="text-lg font-extrabold text-slate-500">{unit}</span>}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={`rounded-full px-6 py-3 text-base font-extrabold shadow transition ${
            canSubmit
              ? "bg-gradient-to-r from-orange-400 to-coral text-white hover:-translate-y-0.5"
              : "cursor-default bg-slate-200 text-slate-400"
          }`}
        >
          {t("common.check")}
        </button>
      </div>

      {status !== "idle" && (
        <div
          className={`mt-4 animate-pop-in rounded-2xl border-4 p-4 ${
            status === "correct" ? "border-lime-300 bg-lime-50" : "border-orange-300 bg-orange-50"
          }`}
        >
          <p
            className={`text-base font-extrabold ${
              status === "correct" ? "text-lime-800" : "text-orange-800"
            }`}
          >
            {status === "correct" ? `🎉 ${t("common.correct")}` : `💪 ${t("common.wrong")}`}
          </p>
          {status === "wrong" && (
            <p className="mt-1 text-sm font-bold text-slate-700">
              {t("common.answer", { answer: formatNumber(item.answer) })}
            </p>
          )}
          {item.explanation && (
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
              💡 {t("common.explanation")}: {toText(item.explanation, locale)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
