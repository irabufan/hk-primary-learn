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
  return score;
}

function retrieveCurriculumContext({ subject, year, topic, limit = 5 }) {
  const band = yearBand(year);
  const lim = Math.max(3, Math.min(8, limit));
  const queryTokens = new Set(tokenize([topic, year, band, subject].join(" ")));
  const scored = chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, { subject, year, band, topic, queryTokens }),
    }))
    .filter((row) => Number.isFinite(row.score) && row.score > 0)
    .filter((row) => row.chunk.topics.includes(topic) || row.score >= 3)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id));

  const final = scored.slice(0, lim);
  if (!final.length) return "";

  const lines = [
    "Official / EDB-aligned learning targets (use these; do not invent off-year content):",
  ];
  for (const { chunk } of final) {
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
assert.ok(chunks.length >= 40 && chunks.length <= 120, `chunk count ${chunks.length}`);

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

// Demo one prompt block
console.log("=== sample: maths / fractions / P4 ===\n");
console.log(
  retrieveCurriculumContext({
    subject: "maths",
    year: "P4",
    topic: "fractions",
    limit: 5,
  }),
);
console.log(`\n=== matrix ok (${chunks.length} chunks, all subject/topic/year combos non-empty) ===`);
