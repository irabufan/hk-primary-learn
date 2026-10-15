"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { FillItem } from "@/lib/exercises/content";

type Props = {
  items: FillItem[];
  onComplete: (score: number, total: number) => void;
};

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function FillBlank({ items, onComplete }: Props) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  const item = items[idx]!;
  const isCorrect = norm(value) === norm(item.answer);

  function check() {
    if (!value.trim() || locked) return;
    setLocked(true);
    if (norm(value) === norm(item.answer)) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= items.length) {
      onComplete(score, items.length);
      return;
    }
    setIdx((i) => i + 1);
    setValue("");
    setLocked(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-indigo-700">
        {t("common.question", { n: idx + 1 })} · {t("common.of", { a: idx + 1, b: items.length })}
      </p>
      <p className="text-lg font-semibold text-ink whitespace-pre-wrap">{item.prompt}</p>
      <input
        type="text"
        value={value}
        disabled={locked}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !locked) check();
        }}
        className="w-full rounded-xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-sky-400 focus:outline-none"
        placeholder="…"
        autoComplete="off"
      />
      {locked && (
        <div>
          <p className={`font-bold ${isCorrect ? "text-lime-700" : "text-coral"}`}>
            {isCorrect ? t("common.correct") : t("common.wrong")}
          </p>
          {!isCorrect && (
            <p className="text-sm text-muted mt-1">
              {t("quiz.correctAnswer")}: <strong>{item.answer}</strong>
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        {!locked ? (
          <button type="button" disabled={!value.trim()} onClick={check} className="btn-primary">
            {t("common.check")}
          </button>
        ) : idx + 1 >= items.length ? (
          <button type="button" onClick={() => onComplete(score, items.length)} className="btn-primary">
            {t("common.done")}
          </button>
        ) : (
          <button type="button" onClick={next} className="btn-primary">
            {t("common.next")}
          </button>
        )}
      </div>
    </div>
  );
}
