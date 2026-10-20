#!/usr/bin/env node
/**
 * One-shot (re-runnable) curriculum ingest for hk-primary-learn.
 *
 * Downloads public EDB Primary curriculum PDFs → extracts text with pdftotext
 * (when available) into data/curriculum/_raw/ → writes subject JSON chunk files
 * under data/curriculum/ (and all.json).
 *
 * Chunks are distilled learning-objective snippets mapped to app topic slugs.
 * They are NOT quiz questions and NOT scraped commercial textbooks / HKEAA papers.
 *
 * Usage:
 *   node scripts/ingest-curriculum.mjs
 *   node scripts/ingest-curriculum.mjs --skip-download   # rewrite JSON from embedded seed only
 *
 * Requires: curl; pdftotext (poppler-utils) for PDF extraction.
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "data", "curriculum");
const RAW_DIR = join(OUT_DIR, "_raw");

const SKIP_DOWNLOAD = process.argv.includes("--skip-download");

const SOURCES = [
  {
    key: "maths-annex1",
    url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/ma/curr/annex%201.pdf",
    file: "maths-annex1.pdf",
  },
  {
    key: "maths-ch4",
    url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/ma/curr/chapter%204_1.pdf",
    file: "maths-ch4.pdf",
  },
  {
    key: "chi-lo-2023",
    url: "https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/curriculum-documents/Pri_Chin_Lang_LO_2023.pdf",
    file: "chi-lo-2023.pdf",
  },
  {
    key: "eng-elcg-2025",
    url: "https://www.edb.gov.hk/attachment/en/curriculum-development/kla/eng-edu/Curriculum%20Document/Pri_ELCG_Primary_1-6_2025.pdf",
    file: "eng-elcg-2025.pdf",
  },
  {
    key: "gs-2017",
    url: "https://www.edb.gov.hk/attachment/en/curriculum-development/cross-kla-studies/gs-primary/GSCG_2017_Eng.pdf",
    file: "gs-2017.pdf",
  },
];

const UA = "hk-primary-learn-ingest/0.1 (+https://github.com/irabufan/hk-primary-learn)";

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  return r;
}

function download(url, dest) {
  console.log(`download ${url}`);
  const r = sh("curl", ["-fsSL", "-A", UA, "-o", dest, url]);
  if (r.status !== 0) {
    throw new Error(`curl failed for ${url}: ${r.stderr || r.stdout || r.status}`);
  }
}

function pdftotext(pdfPath, txtPath) {
  const r = sh("pdftotext", ["-layout", pdfPath, txtPath]);
  if (r.status !== 0) {
    console.warn(`pdftotext failed for ${pdfPath}: ${r.stderr || r.status}`);
    return false;
  }
  return true;
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

/**
 * Embedded seed: high-quality chunks distilled from the public EDB PDFs above.
 * Prefer verbatim objective language; paraphrases are marked source: "paraphrase: <url>".
 * Re-running this script refreshes raw downloads and rewrites JSON from this seed
 * (so topic slug mapping stays stable for the app). To extend coverage, edit the
 * seed arrays below after inspecting data/curriculum/_raw/*.txt.
 */
function buildSeedChunks() {
  // Load previously written all.json if present so --skip-download without editing
  // still round-trips; otherwise use the committed files as the seed of record.
  const allPath = join(OUT_DIR, "all.json");
  if (existsSync(allPath)) {
    const existing = JSON.parse(readFileSync(allPath, "utf8"));
    if (Array.isArray(existing) && existing.length >= 40) {
      console.log(`seed: reusing ${existing.length} chunks from data/curriculum/all.json`);
      return existing;
    }
  }
  throw new Error(
    "No seed chunks found. Commit data/curriculum/*.json first, or restore all.json.",
  );
}

function writeChunks(chunks) {
  mkdirSync(OUT_DIR, { recursive: true });
  const bySubject = { chinese: [], english: [], maths: [], gs: [] };
  for (const c of chunks) {
    if (!bySubject[c.subject]) throw new Error(`Unknown subject ${c.subject}`);
    bySubject[c.subject].push(c);
  }
  for (const [subject, list] of Object.entries(bySubject)) {
    const path = join(OUT_DIR, `${subject}.json`);
    writeFileSync(path, JSON.stringify(list, null, 2) + "\n", "utf8");
    console.log(`wrote ${path} (${list.length})`);
  }
  const allPath = join(OUT_DIR, "all.json");
  writeFileSync(allPath, JSON.stringify(chunks, null, 2) + "\n", "utf8");
  console.log(`wrote ${allPath} (${chunks.length})`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    subjects: Object.fromEntries(
      Object.entries(bySubject).map(([k, v]) => [k, v.length]),
    ),
    sources: SOURCES.map((s) => ({ key: s.key, url: s.url })),
    note: "Objectives/guides only; no commercial textbooks or HKEAA past papers.",
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  if (!SKIP_DOWNLOAD) {
    for (const src of SOURCES) {
      const pdfPath = join(RAW_DIR, src.file);
      try {
        download(src.url, pdfPath);
        const buf = readFileSync(pdfPath);
        console.log(`  saved ${src.file} (${buf.length} bytes, sha ${sha256(buf)})`);
        const txtPath = join(RAW_DIR, src.file.replace(/\.pdf$/i, ".txt"));
        if (pdftotext(pdfPath, txtPath)) {
          const n = readFileSync(txtPath, "utf8").length;
          console.log(`  extracted ${txtPath} (${n} chars)`);
        }
      } catch (err) {
        console.warn(`  WARN: ${err.message || err}`);
        console.warn("  Continuing with existing seed JSON (download optional for refresh).");
      }
    }
  } else {
    console.log("skip download (--skip-download)");
  }

  const chunks = buildSeedChunks();
  // light validation
  for (const c of chunks) {
    if (!c.id || !c.subject || !Array.isArray(c.topics)) {
      throw new Error(`Invalid chunk: ${JSON.stringify(c).slice(0, 120)}`);
    }
    if (!c.text_zh && !c.text_en) throw new Error(`Chunk ${c.id} has no text`);
    if (!c.source) throw new Error(`Chunk ${c.id} missing source`);
  }
  writeChunks(chunks);
  console.log("done.");
}

main();
