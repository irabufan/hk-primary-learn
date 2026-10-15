"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { MatchItem } from "@/lib/exercises/content";
import { mulberry32, shuffle } from "@/lib/rng";

type Props = {
  items: MatchItem[];
  onComplete: (score: number, total: number) => void;
};

export function MatchPairs({ items, onComplete }: Props) {
  const { t } = useI18n();
  const rights = useMemo(() => {
    const rng = mulberry32(42);
    return shuffle(
      rng,
      items.map((i) => ({ id: i.id, text: i.right })),
    );
  }, [items]);

  const [leftId, setLeftId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [wrongTries, setWrongTries] = useState(0);

  const leftRemaining = items.filter((i) => !matched[i.id]);
  const rightRemaining = rights.filter((r) => !matched[r.id]);
  const doneCount = Object.keys(matched).length;
  const total = items.length;

  function pickRight(rightId: string) {
    if (!leftId) return;
    if (leftId === rightId) {
      setMatched((m) => ({ ...m, [leftId]: true }));
      setFeedback("ok");
      setLeftId(null);
      const nextCount = doneCount + 1;
      if (nextCount >= total) {
        // score = total - wrongTries but floor at 0; simpler: correct pairs
        const score = Math.max(0, total - wrongTries);
        setTimeout(() => onComplete(Math.min(score, total), total), 400);
      }
    } else {
      setFeedback("bad");
      setWrongTries((w) => w + 1);
      setLeftId(null);
    }
    setTimeout(() => setFeedback(null), 700);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t("exercise.matchHint")}</p>
      <p className="text-sm font-medium text-indigo-700">
        {t("common.of", { a: doneCount, b: total })}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {leftRemaining.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setLeftId(i.id)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left font-semibold transition ${
                leftId === i.id
                  ? "border-coral bg-coral/15"
                  : "border-line bg-white hover:border-sky-300"
              }`}
            >
              {i.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightRemaining.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => pickRight(r.id)}
              disabled={!leftId}
              className="w-full rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 text-left font-medium text-ink-soft hover:border-indigo-400 disabled:opacity-50"
            >
              {r.text}
            </button>
          ))}
        </div>
      </div>
      {feedback === "ok" && <p className="font-bold text-lime-700">{t("common.correct")}</p>}
      {feedback === "bad" && <p className="font-bold text-coral">{t("common.wrong")}</p>}
      {!leftId && leftRemaining.length > 0 && (
        <p className="text-sm text-muted">{t("exercise.pickLeft")}</p>
      )}
      {leftId && <p className="text-sm text-muted">{t("exercise.pickRight")}</p>}
    </div>
  );
}
