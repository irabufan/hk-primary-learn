#!/usr/bin/env node
/**
 * Dry-run: score file-backed curriculum chunks and print the prompt block
 * that buildQuizPrompt injects. No LLM call.
 *
 * Usage:
 *   node scripts/verify-curriculum-prompt.mjs
 *   node scripts/verify-curriculum-prompt.mjs --subject maths --year P4 --topic fractions
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const chunks = JSON.parse(
  readFileSync(join(ROOT, "data/curriculum/all.json"), "utf8"),
);

function yearBand(year) {
  return year === "P1" || year === "P2" || year === "P3" ? "KS1" : "KS2";
}

function tokenize(text) {
  const lower = text.toLowerCase();
  const latin = lower.match(/[a-z0-9]+/g) ?? [];
  const cjk = text.match(/[\u3400-\u9fff\uf900-\ufaff]{1,}/g) ?? [];
  const cjkTokens = [];
  for (const run of cjk) {
    if (run.length === 1) cjkTokens.push(run);
    else {
      for (let i = 0; i < run.length; i++) cjkTokens.push(run[i]);
      for (let i = 0; i < run.length - 1; i++) cjkTokens.push(run.slice(i, i + 2));
    }
  }
  return [...latin, ...cjkTokens];
}

function chunkText(chunk) {
  return [chunk.text_en, chunk.text_zh].filter(Boolean).join("\n");
}

function yearMatches(chunk, year, band) {
  if (chunk.years?.length) return chunk.years.includes(year);
  if (chunk.band) return chunk.band === band;
  return true;
}

function isPractice(chunk) {
  return chunk.kind === "practice";
}

function scoreChunk(chunk, { subject, year, band, topic, queryTokens }) {
  if (chunk.subject !== subject) return -Infinity;
  if (!yearMatches(chunk, year, band)) return -Infinity;
  let score = 0;
  if (chunk.topics.includes(topic)) score += 10;
  else if (chunk.topics.length === 0) score += 1;
  if (chunk.years?.includes(year)) score += 4;
  else if (chunk.band === band) score += 2;
  const bodyTokens = tokenize(chunkText(chunk));
  let overlap = 0;
  for (const t of bodyTokens) if (queryTokens.has(t)) overlap += 1;
  score += Math.min(6, overlap * 0.35);
  if (chunk.text_zh && chunk.text_en) score += 0.5;
  if (isPractice(chunk) && chunk.topics.includes(topic)) score += 1.25;
  return score;
}

function pickCurriculumChunks({ subject, year, topic, limit = 5 }) {
  const band = yearBand(year);
  const lim = Math.max(3, Math.min(8, limit));
  const queryTokens = new Set(tokenize([topic, year, band, subject].join(" ")));
  const ranked = chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, { subject, year, band, topic, queryTokens }),
    }))
    .filter((row) => Number.isFinite(row.score) && row.score > 0)
    .filter((row) => row.chunk.topics.includes(topic) || row.score >= 3)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id));

  if (!ranked.length) return [];

  const practiceSlots = Math.min(2, Math.max(1, Math.floor(lim / 3)));
  const practice = ranked.filter((r) => isPractice(r.chunk)).slice(0, practiceSlots);
  const objectives = ranked.filter((r) => !isPractice(r.chunk));
  const picked = [];
  const seen = new Set();
  for (const row of objectives) {
    if (picked.length >= lim - practice.length) break;
    picked.push(row);
    seen.add(row.chunk.id);
  }
  for (const row of practice) {
    if (picked.length >= lim) break;
    if (seen.has(row.chunk.id)) continue;
    picked.push(row);
    seen.add(row.chunk.id);
  }
  for (const row of ranked) {
    if (picked.length >= lim) break;
    if (seen.has(row.chunk.id)) continue;
    picked.push(row);
    seen.add(row.chunk.id);
  }
  picked.sort((a, b) => {
    const ap = isPractice(a.chunk) ? 1 : 0;
    const bp = isPractice(b.chunk) ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return b.score - a.score || a.chunk.id.localeCompare(b.chunk.id);
  });
  return picked.map((r) => r.chunk);
}

function retrieveCurriculumContext({ subject, year, topic, limit = 5 }) {
  const final = pickCurriculumChunks({ subject, year, topic, limit });
  if (!final.length) return "";

  const hasPractice = final.some(isPractice);
  const lines = [
    hasPractice
      ? "Official / EDB-aligned learning targets and open practice patterns (use these; do not invent off-year content):"
      : "Official / EDB-aligned learning targets (use these; do not invent off-year content):",
  ];
  for (const chunk of final) {
    const label = [
      chunk.id,
      chunk.kind === "practice" ? "practice" : undefined,
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

const TOPICS = {
  chinese: ["vocab", "reading", "sentences"],
  english: ["vocabulary", "reading", "grammar"],
  maths: ["fractions", "decimals", "word-problems"],
  gs: ["healthy-living", "community", "nature-science"],
};
const YEARS = ["P1", "P2", "P3", "P4", "P5", "P6"];

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => {
    if (a.startsWith("--") && arr[i + 1] && !arr[i + 1].startsWith("--")) {
      return [[a.slice(2), arr[i + 1]]];
    }
    return [];
  }),
);

if (args.subject && args.year && args.topic) {
  const block = retrieveCurriculumContext({
    subject: args.subject,
    year: args.year,
    topic: args.topic,
    limit: Number(args.limit || 5),
  });
  assert.ok(block.includes("Official / EDB-aligned learning targets"));
  console.log(block);
  console.log("\n--- ok ---");
  process.exit(0);
}

// Full matrix: every subject × topic × year must retrieve a non-empty block.
let failures = 0;
for (const [subject, topics] of Object.entries(TOPICS)) {
  for (const topic of topics) {
    for (const year of YEARS) {
      const block = retrieveCurriculumContext({ subject, year, topic, limit: 5 });
      if (!block || !block.includes("Official / EDB-aligned")) {
        console.error(`FAIL ${subject}/${topic}/${year}: empty retrieve`);
        failures++;
      }
    }
  }
}

assert.equal(failures, 0, `${failures} retrieve failures`);
assert.ok(
  chunks.length >= 40 && chunks.length <= 160,
  `chunk count ${chunks.length} out of range 40–160`,
);

const practice = chunks.filter((c) => c.kind === "practice");
assert.ok(practice.length >= 20, `expected ≥20 practice chunks, got ${practice.length}`);
for (const c of practice) {
  assert.ok(
    /^practice: |^paraphrase-practice: /.test(c.source),
    `practice ${c.id} bad source: ${c.source}`,
  );
  assert.ok(c.sourceUrl, `practice ${c.id} missing sourceUrl`);
}

// Spot-check: no HKEAA / textbook markers in sources
const banned = /hkeaa|past paper|教科書|textbook publisher|商務印書館|培生|朗文練習/i;
for (const c of chunks) {
  assert.ok(!banned.test(c.source + (c.text_en || "") + (c.text_zh || "")), `banned marker in ${c.id}`);
}

const subjects = new Set(chunks.map((c) => c.subject));
for (const s of ["chinese", "english", "maths", "gs"]) {
  assert.ok(subjects.has(s), `missing subject ${s}`);
}

// Spot-check: buildQuizPrompt wiring exists in source
const llmClient = readFileSync(join(ROOT, "lib/quiz/llm-client.ts"), "utf8");
assert.ok(
  llmClient.includes("retrieveCurriculumContext"),
  "llm-client.ts must call retrieveCurriculumContext",
);
assert.ok(
  llmClient.includes("retrievedOrFallbackCurriculum"),
  "llm-client.ts must use retrievedOrFallbackCurriculum in buildQuizPrompt",
);
assert.ok(
  llmClient.includes("curriculumGuidanceBlock"),
  "llm-client must keep curriculumGuidanceBlock as empty-retrieve fallback",
);
const retrieveSrc = readFileSync(join(ROOT, "lib/curriculum-retrieve.ts"), "utf8");
assert.ok(
  retrieveSrc.includes("Official / EDB-aligned learning targets"),
  "retrieve module must emit the Official / EDB-aligned prompt header",
);
assert.ok(
  retrieveSrc.includes('kind === "practice"') || retrieveSrc.includes("isPractice"),
  "retrieve must recognise practice kind",
);

// Practice should appear for a known topic
const sample = retrieveCurriculumContext({
  subject: "maths",
  year: "P4",
  topic: "fractions",
  limit: 5,
});
assert.ok(sample.includes("practice"), "fractions retrieve should mix in a practice chunk");

console.log("=== sample: maths / fractions / P4 ===\n");
console.log(sample);
console.log(
  `\n=== matrix ok (${chunks.length} chunks, ${practice.length} practice, all subject/topic/year combos non-empty) ===`,
);
