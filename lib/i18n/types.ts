export type Locale = "en" | "zh-HK";

export const LOCALES: Locale[] = ["en", "zh-HK"];

export const DEFAULT_LOCALE: Locale = "zh-HK";

export const LOCALE_STORAGE_KEY = "hklearn-locale";

/** Text that may be provided in either or both UI languages. */
export type Localized = { zh?: string; en?: string };

/** The same text in both languages (e.g. pure arithmetic explanations). */
export function both(text: string): Localized {
  return { zh: text, en: text };
}

/** Pick the text for a locale, falling back to whichever language exists. */
export function toText(text: Localized, locale: Locale): string {
  if (locale === "en") return text.en ?? text.zh ?? "";
  return text.zh ?? text.en ?? "";
}

/** Normalise a typed answer: case-fold, trim, and drop punctuation noise. */
export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[，。！？、；：「」『』（）()]/g, " ")
    .replace(/[,.!?;:'"_-]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pretty-print a number without trailing zeros (0.7500 → 0.75, 10 → 10). */
export function formatNumber(value: number): string {
  return String(Number(value.toFixed(4)));
}
