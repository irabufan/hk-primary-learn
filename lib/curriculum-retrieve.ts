/**
 * File-backed curriculum retrieval (no DB, no embeddings).
 * Chunks ship as static JSON under data/curriculum/ and are bundled via import.
 */

import type { SubjectSlug, Year } from "@/lib/curriculum";
import { yearBand, type YearBand } from "@/lib/curriculum-guidance";

import allChunks from "@/data/curriculum/all.json";

export type CurriculumChunk = {
  id: string;
  subject: SubjectSlug;
  years?: Year[];
  band?: YearBand;
  topics: string[];
  text_zh?: string;
  text_en?: string;
  source: string;
  sourceUrl?: string;
};

export type RetrieveCurriculumOptions = {
  subject: SubjectSlug;
  year: Year;
  topic: string;
  /** Max snippets to return (clamped to 3–8; default 5). */
  limit?: number;
};

const CHUNKS = allChunks as CurriculumChunk[];

const YEAR_SET: ReadonlySet<string> = new Set(["P1", "P2", "P3", "P4", "P5", "P6"]);

function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const latin = lower.match(/[a-z0-9]+/g) ?? [];
  const cjk = text.match(/[\u3400-\u9fff\uf900-\ufaff]{1,}/g) ?? [];
  // Split CJK into overlapping bigrams + singles for coarse overlap.
  const cjkTokens: string[] = [];
  for (const run of cjk) {
    if (run.length === 1) cjkTokens.push(run);
    else {
      for (let i = 0; i < run.length; i++) cjkTokens.push(run[i]!);
      for (let i = 0; i < run.length - 1; i++) cjkTokens.push(run.slice(i, i + 2));
    }
  }
  return [...latin, ...cjkTokens];
}

function chunkText(chunk: CurriculumChunk): string {
  return [chunk.text_en, chunk.text_zh].filter(Boolean).join("\n");
}

function yearMatches(chunk: CurriculumChunk, year: Year, band: YearBand): boolean {
  if (chunk.years?.length) return chunk.years.includes(year);
  if (chunk.band) return chunk.band === band;
  // Untagged chunks suit any year within the subject filter.
  return true;
}

function scoreChunk(
  chunk: CurriculumChunk,
  opts: { subject: SubjectSlug; year: Year; band: YearBand; topic: string; queryTokens: Set<string> },
): number {
  if (chunk.subject !== opts.subject) return -Infinity;
  if (!yearMatches(chunk, opts.year, opts.band)) return -Infinity;

  let score = 0;

  // Topic tag match (primary signal).
  if (chunk.topics.includes(opts.topic)) score += 10;
  else if (chunk.topics.length === 0) score += 1;
  else score += 0; // keep as weak candidate for keyword overlap only

  // Exact year list beats band-only.
  if (chunk.years?.includes(opts.year)) score += 4;
  else if (chunk.band === opts.band) score += 2;

  // Keyword overlap against topic slug + year label.
  const bodyTokens = tokenize(chunkText(chunk));
  let overlap = 0;
  for (const t of bodyTokens) {
    if (opts.queryTokens.has(t)) overlap += 1;
  }
  // Cap overlap contribution so tags still dominate.
  score += Math.min(6, overlap * 0.35);

  // Prefer bilingual when available.
  if (chunk.text_zh && chunk.text_en) score += 0.5;

  return score;
}

function pickCurriculumChunks(opts: RetrieveCurriculumOptions): CurriculumChunk[] {
  const { subject, year, topic } = opts;
  const band = yearBand(year);
  const limit = Math.max(3, Math.min(8, opts.limit ?? 5));
  const queryTokens = new Set(tokenize([topic, year, band, subject].join(" ")));

  return CHUNKS.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, { subject, year, band, topic, queryTokens }),
  }))
    .filter((row) => Number.isFinite(row.score) && row.score > 0)
    // Require at least a topic hit OR solid year/band + some text — drop pure noise.
    .filter((row) => row.chunk.topics.includes(topic) || row.score >= 3)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, limit)
    .map((row) => row.chunk);
}

/**
 * Filter/score curriculum chunks by subject + year/band + topic tags,
 * with light keyword overlap. Returns 3–8 short snippets as a prompt block,
 * or empty string when nothing useful matches (caller should fall back).
 */
export function retrieveCurriculumContext(opts: RetrieveCurriculumOptions): string {
  const final = pickCurriculumChunks(opts);
  if (final.length === 0) return "";

  const lines: string[] = [
    "Official / EDB-aligned learning targets (use these; do not invent off-year content):",
  ];

  for (const chunk of final) {
    const label = [
      chunk.id,
      chunk.band ?? (chunk.years ? chunk.years.join("/") : undefined),
      chunk.topics.join(","),
    ]
      .filter(Boolean)
      .join(" · ");

    const body =
      chunk.text_zh && chunk.text_en
        ? `${chunk.text_zh}\n  ${chunk.text_en}`
        : chunk.text_zh || chunk.text_en || "";

    lines.push(`- [${label}] ${body}`);
    lines.push(`  source: ${chunk.source}`);
  }

  return lines.join("\n");
}

/** Test/helper: return selected chunks for a query (no prompt formatting). */
export function retrieveCurriculumChunks(
  opts: RetrieveCurriculumOptions,
): CurriculumChunk[] {
  return pickCurriculumChunks(opts);
}

export function curriculumChunkCount(): number {
  return CHUNKS.length;
}

export function listCurriculumSubjects(): SubjectSlug[] {
  return [...new Set(CHUNKS.map((c) => c.subject))] as SubjectSlug[];
}

/** Guard: years field only contains P1–P6 when present. */
export function assertCurriculumChunkShape(chunk: CurriculumChunk): void {
  if (chunk.years) {
    for (const y of chunk.years) {
      if (!YEAR_SET.has(y)) throw new Error(`Invalid year in chunk ${chunk.id}: ${y}`);
    }
  }
}
