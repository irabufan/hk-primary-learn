"use client";

import { useState, type KeyboardEvent } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import type { FillItem, OnAnswered } from "@/lib/exercises/types";
import { answersEqual } from "@/lib/quiz/answers";

type FillBlankProps = {
  item: FillItem;
  onAnswered?: OnAnswered;
};

/** Fill-in-the-blank question: type the missing word, get instant feedback. */
export function FillBlank({ item, onAnswered }: FillBlankProps) {
  const { locale, t } = useI18n();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const canSubmit = status === "idle" && value.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const correct = item.accept.some((accepted) => answersEqual(value, accepted));
    setStatus(correct ? "correct" : "wrong");
    onAnswered?.(correct, value.trim());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") submit();
  };

  return (
    <div>
      {item.passage && (
        <blockquote className="mb-4 rounded-2xl border-2 border-sky-100 bg-sky-50 p-4 text-base font-medium leading-relaxed text-slate-700 whitespace-pre-line">
          {toText(item.passage, locale)}
        </blockquote>
      )}

      <h2 className="text-lg font-extrabold leading-relaxed text-indigo-900 sm:text-xl">
        {toText(item.prompt, locale)}
      </h2>

      {item.hint && status === "idle" && (
        <p className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800">
          💡 {t("common.hint", { text: toText(item.hint, locale) })}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status !== "idle"}
          aria-label={toText(item.prompt, locale)}
          autoComplete="off"
          autoFocus
          className={`w-full max-w-sm rounded-2xl border-4 px-4 py-3 text-center text-lg font-extrabold text-slate-800 shadow-sm outline-none transition focus:border-sky-400 sm:text-left ${
            status === "correct"
              ? "border-lime-500 bg-lime-50"
              : status === "wrong"
                ? "animate-shake border-coral bg-orange-50"
                : "border-sky-200 bg-white"
          } ${status !== "idle" ? "cursor-default" : ""}`}
        />
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
              {t("common.answer", { answer: item.accept[0] })}
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
