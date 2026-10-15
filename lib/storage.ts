import type { Year } from "@/lib/curriculum";

const YEAR_KEY = "hklearn-year";
const PROGRESS_KEY = "hklearn-progress";

export function getStoredYear(): Year | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(YEAR_KEY);
    if (v === "P4" || v === "P5" || v === "P6") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredYear(year: Year): void {
  try {
    localStorage.setItem(YEAR_KEY, year);
  } catch {
    /* ignore */
  }
}

export type ProgressEntry = {
  subject: string;
  topic: string;
  bestScore: number;
  attempts: number;
  updatedAt: number;
};

export function getProgress(): ProgressEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProgressEntry[];
  } catch {
    return [];
  }
}

export function recordProgress(subject: string, topic: string, score: number): void {
  try {
    const list = getProgress();
    const idx = list.findIndex((p) => p.subject === subject && p.topic === topic);
    if (idx >= 0) {
      const cur = list[idx]!;
      list[idx] = {
        ...cur,
        bestScore: Math.max(cur.bestScore, score),
        attempts: cur.attempts + 1,
        updatedAt: Date.now(),
      };
    } else {
      list.push({
        subject,
        topic,
        bestScore: score,
        attempts: 1,
        updatedAt: Date.now(),
      });
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
