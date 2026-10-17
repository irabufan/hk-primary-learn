export type Rng = () => number;

/**
 * Deterministic PRNG (mulberry32). The same seed always produces the same
 * sequence, which is what makes quiz generation reproducible: two different
 * seeds produce two different quizzes.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh non-deterministic seed — used whenever we want new variety. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

/** Inclusive random integer in [min, max]. */
export function pickInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick one element (returns undefined for an empty list). */
export function pickOne<T>(rng: Rng, items: readonly T[]): T | undefined {
  return items[Math.floor(rng() * items.length)];
}

/** Fisher–Yates shuffle, returns a copy. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Random subset without replacement. */
export function sample<T>(rng: Rng, items: readonly T[], count: number): T[] {
  return shuffle(rng, items).slice(0, Math.max(0, count));
}
