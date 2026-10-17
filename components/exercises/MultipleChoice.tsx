"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { toText } from "@/lib/i18n/types";
import type { McItem, OnAnswered } from "@/lib/exercises/types";

type MultipleChoiceProps = {
  item: McItem;
  onAnswered?: OnAnswered;
};

/** Multiple-choice question with instant feedback and explanation. */
export function MultipleChoice({ item, onAnswered }: MultipleChoiceProps) {
  const { locale, t } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = answered && selected === item.answerIndex;

  const handleChoice = (index: number) => {
    if (answered) return;
    setSelected(index);
    onAnswered?.(index === item.answerIndex, item.choices[index]);
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

      <ul className="mt-4 space-y-2.5">
        {item.choices.map((choice, index) => {
          const isCorrect = answered && index === item.answerIndex;
          const isWrongPick = answered && index === selected && index !== item.answerIndex;
          return (
            <li key={choice}>
              <button
                type="button"
                onClick={() => handleChoice(index)}
                disabled={answered}
                className={`flex w-full items-center gap-3 rounded-2xl border-4 px-4 py-3.5 text-left text-base font-bold transition ${
                  isCorrect
                    ? "animate-pop-in border-lime-500 bg-lime-50 text-lime-900"
                    : isWrongPick
                      ? "animate-shake border-coral bg-orange-50 text-orange-900"
                      : answered
                        ? "border-slate-200 bg-white text-slate-400"
                        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50"
                } ${answered ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  aria-hidden
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                    isCorrect
                      ? "bg-lime-500 text-white"
                      : isWrongPick
                        ? "bg-coral text-white"
                        : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {isCorrect ? "✓" : isWrongPick ? "✗" : String.fromCharCode(65 + index)}
                </span>
                <span className="leading-relaxed">{choice}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div
          className={`mt-4 animate-pop-in rounded-2xl border-4 p-4 ${
            correct ? "border-lime-300 bg-lime-50" : "border-orange-300 bg-orange-50"
          }`}
        >
          <p
            className={`text-base font-extrabold ${correct ? "text-lime-800" : "text-orange-800"}`}
          >
            {correct ? `🎉 ${t("common.correct")}` : `💪 ${t("common.wrong")}`}
          </p>
          {!correct && (
            <p className="mt-1 text-sm font-bold text-slate-700">
              {t("common.answer", { answer: item.choices[item.answerIndex] })}
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
