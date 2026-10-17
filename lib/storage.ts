import { isYear, type SubjectSlug, type Year } from "@/lib/curriculum";

const YEAR_KEY = "hklearn-year";
const PROGRESS_KEY = "hklearn-progress";

const MAX_PROGRESS_ENTRIES = 50;

export type ProgressKind = "exercise" | "quiz";

export type ProgressEntry = {
  id: string;
  kind: ProgressKind;
  subject: SubjectSlug;
  topic: string;
  score: number;
  total: number;
  at: number;
};

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Stored year (validated), or null if never saved. */
export function getStoredYear(): Year | null {
  const stored = safeGet(YEAR_KEY);
  return stored && isYear(stored) ? stored : null;
}

export function setStoredYear(year: Year): void {
  safeSet(YEAR_KEY, year);
}

function isProgressEntry(value: unknown): value is ProgressEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<ProgressEntry>;
  return (
    typeof entry.id === "string" &&
    (entry.kind === "exercise" || entry.kind === "quiz") &&
    typeof entry.subject === "string" &&
    typeof entry.topic === "string" &&
    typeof entry.score === "number" &&
    typeof entry.total === "number" &&
    typeof entry.at === "number"
  );
}

/** Best-effort read of the practice history (newest first). */
export function getProgress(): ProgressEntry[] {
  const raw = safeGet(PROGRESS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProgressEntry).slice(0, MAX_PROGRESS_ENTRIES);
  } catch {
    return [];
  }
}

/** Record a finished exercise or quiz (best effort, never throws). */
export function addProgress(entry: Omit<ProgressEntry, "id" | "at">): ProgressEntry | null {
  const full: ProgressEntry = {
    ...entry,
    id: `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    at: Date.now(),
  };
  const next = [full, ...getProgress()].slice(0, MAX_PROGRESS_ENTRIES);
  safeSet(PROGRESS_KEY, JSON.stringify(next));
  return full;
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}
