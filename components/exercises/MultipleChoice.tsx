"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { McItem } from "@/lib/exercises/content";

type Props = {
  items: McItem[];
  onComplete: (score: number, total: number) => void;
};

export function MultipleChoice({ items, onComplete }: Props) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  const item = items[idx]!;
  const isCorrect = selected === item.answer;

  function check() {
    if (!selected || locked) return;
    setLocked(true);
    if (selected === item.answer) setScore((s) => s + 1);
  }

  function goNext(currentScore: number) {
    if (idx + 1 >= items.length) {
      onComplete(currentScore, items.length);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setLocked(false);
  }

  function next() {
    const currentScore = score;
    goNext(currentScore);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-indigo-700">
        {t("common.question", { n: idx + 1 })} · {t("common.of", { a: idx + 1, b: items.length })}
      </p>
      {item.passage && (
        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 text-ink-soft leading-relaxed whitespace-pre-wrap">
          {item.passage}
        </div>
      )}
      <p className="text-lg font-semibold text-ink whitespace-pre-wrap">{item.prompt}</p>
      <div className="grid gap-2">
        {item.choices.map((c) => {
          let cls =
            "rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition ";
          if (!locked) {
            cls +=
              selected === c
                ? "border-coral bg-coral/10 text-ink"
                : "border-line bg-white hover:border-sky-300";
          } else if (c === item.answer) {
            cls += "border-lime-500 bg-lime-50 text-ink";
          } else if (c === selected) {
            cls += "border-coral bg-coral/15 text-ink line-through opacity-80";
          } else {
            cls += "border-line bg-white opacity-60";
          }
          return (
            <button
              key={c}
              type="button"
              disabled={locked}
              className={cls}
              onClick={() => setSelected(c)}
            >
              {c}
            </button>
          );
        })}
      </div>
      {locked && (
        <p className={`font-bold ${isCorrect ? "text-lime-700" : "text-coral"}`}>
          {isCorrect ? t("common.correct") : t("common.wrong")}
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        {!locked ? (
          <button type="button" disabled={!selected} onClick={check} className="btn-primary">
            {t("common.check")}
          </button>
        ) : (
          <button type="button" onClick={next} className="btn-primary">
            {idx + 1 >= items.length ? t("common.done") : t("common.next")}
          </button>
        )}
      </div>
    </div>
  );
}
