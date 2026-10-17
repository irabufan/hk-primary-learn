"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { mulberry32, randomSeed, shuffle } from "@/lib/rng";
import type { MatchItem } from "@/lib/exercises/types";

export type MatchResult = {
  correct: number;
  total: number;
  misses: number;
};

type MatchPairsProps = {
  item: MatchItem;
  onComplete?: (result: MatchResult) => void;
};

/**
 * Match-pairs game: tap a word on the left, then tap its meaning on the
 * right. Correct pairs lock in green; wrong taps flash and shake.
 */
export function MatchPairs({ item, onComplete }: MatchPairsProps) {
  const { t } = useI18n();

  const [lefts] = useState(() => shuffle(mulberry32(randomSeed()), item.pairs));
  const [rights] = useState(() => shuffle(mulberry32(randomSeed()), item.pairs));
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [firstTry, setFirstTry] = useState<Set<string>>(new Set());
  const [wrongPairs, setWrongPairs] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<{ leftId: string; rightId: string } | null>(null);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completed = useRef(false);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const total = item.pairs.length;
  const matchedCount = matched.size;

  useEffect(() => {
    if (!completed.current && total > 0 && matchedCount === total) {
      completed.current = true;
      onComplete?.({
        correct: firstTry.size,
        total,
        misses,
      });
    }
  }, [matchedCount, total, firstTry, misses, onComplete]);

  const handleLeft = (pairId: string) => {
    if (matched.has(pairId) || completed.current) return;
    setFlash(null);
    setSelectedLeftId((current) => (current === pairId ? null : pairId));
  };

  const handleRight = (pairId: string) => {
    if (matched.has(pairId) || completed.current) return;
    if (!selectedLeftId) return;

    if (selectedLeftId === pairId) {
      // Correct match — lock the pair in.
      const nextMatched = new Set(matched);
      nextMatched.add(pairId);
      setMatched(nextMatched);
      if (!wrongPairs.has(pairId)) {
        const nextFirstTry = new Set(firstTry);
        nextFirstTry.add(pairId);
        setFirstTry(nextFirstTry);
      }
      setSelectedLeftId(null);
      setFlash(null);
      return;
    }

    // Wrong match — flash both tiles, count the miss, deselect.
    const nextWrong = new Set(wrongPairs);
    nextWrong.add(selectedLeftId);
    setWrongPairs(nextWrong);
    setMisses((count) => count + 1);
    setFlash({ leftId: selectedLeftId, rightId: pairId });
    setSelectedLeftId(null);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 650);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-indigo-700">👆 {t("match.instruction")}</p>
        <div className="flex gap-2">
          <span className="rounded-full bg-lime-100 px-3.5 py-1.5 text-sm font-extrabold text-lime-800">
            {t("match.progress", { matched: matchedCount, total })}
          </span>
          {misses > 0 && (
            <span className="rounded-full bg-orange-100 px-3.5 py-1.5 text-sm font-extrabold text-orange-800">
              {t("match.misses", { n: misses })}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ul className="space-y-2.5">
          {lefts.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedLeftId === pair.id;
            const isFlashing = flash?.leftId === pair.id;
            return (
              <li key={`left-${pair.id}`}>
                <button
                  type="button"
                  onClick={() => handleLeft(pair.id)}
                  disabled={isMatched || completed.current}
                  aria-pressed={isSelected}
                  className={`w-full rounded-2xl border-4 px-4 py-3 text-left text-lg font-extrabold transition ${
                    isMatched
                      ? "border-lime-500 bg-lime-50 text-lime-800"
                      : isFlashing
                        ? "animate-shake border-coral bg-orange-50 text-orange-900"
                        : isSelected
                          ? "border-indigo-500 bg-indigo-600 text-white shadow"
                          : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50"
                  } ${isMatched ? "cursor-default" : "cursor-pointer"}`}
                >
                  {isMatched ? `✅ ${pair.left}` : pair.left}
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="space-y-2.5">
          {rights.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isFlashing = flash?.rightId === pair.id;
            return (
              <li key={`right-${pair.id}`}>
                <button
                  type="button"
                  onClick={() => handleRight(pair.id)}
                  disabled={isMatched || completed.current}
                  aria-pressed={selectedLeftId !== null && selectedLeftId === pair.id && !isMatched}
                  className={`w-full rounded-2xl border-4 px-4 py-3 text-left text-base font-bold leading-relaxed transition ${
                    isMatched
                      ? "border-lime-500 bg-lime-50 text-lime-800"
                      : isFlashing
                        ? "animate-shake border-coral bg-orange-50 text-orange-900"
                        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50"
                  } ${isMatched ? "cursor-default" : "cursor-pointer"}`}
                >
                  {isMatched ? `✅ ${pair.right}` : pair.right}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
