# HK Learn — Primary P1–P6 POC

Hong Kong primary learning demo for **中文 / English / Maths / 常識 (GS)** (P1–P6).

**Live:** https://hk-primary-learn.vercel.app

**Interactive exercises** + **on-the-fly quiz generation** (OpenAI-compatible LLM with seeded mock fallback). Bilingual UI chrome: **zh-HK default** + English toggle.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Live LLM quiz generation (OpenAI-compatible)

Quizzes call an OpenAI-compatible chat completions API (`deepseek-v4.1-flash` by default) via a server route. The API key never reaches the browser. If the key is missing or the call fails, the app falls back to the seeded mock generator.

Default base URL is OpenCode Go (`https://opencode.ai/zen/go/v1`); point `LLM_BASE_URL` at any compatible provider to switch later.

### Env vars (names only)

Prefer the generic `LLM_*` names. Existing `OPENCODE_GO_*` values still work (fallbacks) so current Vercel env keeps working.

| Variable | Alias (fallback) | Where | Purpose |
| --- | --- | --- | --- |
| `LLM_API_KEY` | `OPENCODE_GO_API_KEY` | server (`.env.local` / Vercel) | Bearer token |
| `LLM_MODEL` | `OPENCODE_GO_MODEL` | server (optional) | Model id, default `deepseek-v4.1-flash` |
| `LLM_BASE_URL` | `OPENCODE_GO_BASE_URL` | server (optional) | Default `https://opencode.ai/zen/go/v1` |
| `NEXT_PUBLIC_QUIZ_GENERATOR` | — | client (optional) | `llm` (default) or `mock` to force mock |

### Local setup (do not commit secrets)

`.env*` is gitignored. Example with generic names (or keep using `OPENCODE_GO_*`):

```bash
set -a && source ~/.config/opencode/go.env && set +a
printf 'LLM_API_KEY=%s\nLLM_MODEL=deepseek-v4.1-flash\nNEXT_PUBLIC_QUIZ_GENERATOR=llm\n' "$OPENCODE_GO_API_KEY" > .env.local
```

### Architecture

- Interface: `QuizGenerator` in `lib/quiz/types.ts`
- Mock: `lib/quiz/generator.ts` (`MockQuizGenerator`)
- Client adapter: `lib/quiz/llm-generator.ts` posts to `/api/quiz/generate`
- Server LLM client: `lib/quiz/llm-client.ts` (OpenAI-compatible chat completions)
- Route: `app/api/quiz/generate/route.ts`
- Factory: `lib/quiz/llm-stub.ts` tries LLM, falls back to mock

When the base host is OpenCode (`opencode.ai`), the client also sends a stable `x-opencode-session` header (plus `Authorization: Bearer …` and `User-Agent: hk-primary-learn/0.1`). Other hosts omit that OpenCode-specific header.

## Features (v0)

- Home: pick year (P1–P6) + subject
- Subject hubs with 3 topics each across 4 subjects (HK curriculum flavour)
- Interactive exercises: match pairs, fill-blank, multiple choice, number input
- Quiz generator: subject + topic + year + count → live LLM or mock
- Locale toggle 繁體 / EN (persists in `localStorage`)
- Optional local progress in `localStorage` (no accounts)

## Stack

Next.js 15 App Router · TypeScript · Tailwind 4 · lightweight dictionary i18n · OpenAI-compatible LLM


## Curriculum grounding (file-backed, no DB)

Quiz LLM prompts are grounded with short **EDB-aligned learning-target snippets** loaded from static JSON under `data/curriculum/` (bundled via `import` — safe on Vercel serverless). There is **no** Postgres/SQLite/vector DB and **no** embeddings for this spike.

### How retrieve works

`lib/curriculum-retrieve.ts` → `retrieveCurriculumContext({ subject, year, topic, limit })`:

1. Filter chunks by `subject`.
2. Match year via explicit `years` (P1–P6) or `band` (KS1 = P1–P3, KS2 = P4–P6).
3. Score: topic-tag match (primary) + year/band bonus + light keyword overlap on chunk text.
4. Return **3–8** snippets as a prompt block headed *Official / EDB-aligned learning targets…*.
5. `buildQuizPrompt` in `lib/quiz/llm-client.ts` injects that block; if retrieve is empty, it falls back to the thin map in `lib/curriculum-guidance.ts`.

### Refresh the data folder

Public EDB Primary curriculum PDFs (Chinese / English / Maths / General Studies guides and learning-objective annexes) are fetched and text-extracted, then distilled into tagged JSON chunks (not hand-authored quiz questions; not commercial textbooks or HKEAA past papers).

```bash
# Re-download public EDB PDFs into data/curriculum/_raw/ and rewrite JSON from the committed seed
npm run ingest:curriculum

# Or skip network and only rewrite JSON from existing data/curriculum/all.json
node scripts/ingest-curriculum.mjs --skip-download

# Dry-run: print the prompt block for one query, and assert all subject/topic/year combos hit
npm run verify:curriculum
node scripts/verify-curriculum-prompt.mjs --subject maths --year P4 --topic fractions
```

Raw PDFs under `data/curriculum/_raw/` are gitignored (regenerable). Committed artifacts: `data/curriculum/{chinese,english,maths,gs,all}.json`.

### Open practice grounding

In addition to EDB learning-objective chunks, quiz prompts can be mixed with **open practice-pattern** chunks (`kind: "practice"`) — short item stems / skill descriptors distilled from verified-shareable sources (not commercial textbooks, not HKEAA past papers).

### Ingest

```bash
# Merge distilled practice seeds into data/curriculum/{*,all,practice}.json
# (idempotent: replaces prior kind=practice rows, keeps objective chunks)
npm run ingest:practice

# Optional: refresh HTML/PDF snapshots under data/curriculum/_raw/practice/ (gitignored)
node scripts/ingest-practice.mjs --fetch
```

`lib/curriculum-retrieve.ts` reserves **1–2 practice slots** per retrieve (alongside EDB objective snippets) when topic/year match.

### Licences used (verified before ingest)

| Source | Licence | Use in repo |
| --- | --- | --- |
| [Illustrative Mathematics](https://tasks.illustrativemathematics.org/) tasks | CC BY-NC-SA 4.0 | Distilled fraction/decimal/word-problem patterns; attribution URL on each chunk |
| [Chinese Grammar Wiki](https://resources.allsetlearning.com/chinese/grammar/) (AllSet Learning) | CC BY-NC-SA 3.0 | Paraphrased measure-word / SVO / comparison patterns; attribution required; NC+SA |
| EDB *Enhancing English Vocabulary Learning and Teaching at Primary Level* handbook | Explicit **non-profit educational duplication** with acknowledgement | Paraphrased vocab/grammar/reading stems (Sports, Crafts, We Love Hong Kong units) |
| [Pollution in our Rivers](https://probleu.pml.space/en/content/worksheet/1335/) (Earthwatch / ProBleu) | CC BY 4.0 | Distilled freshwater / pollution / human-impact stems for 常識 |

Chunks use `source: "practice: <url>"` or `source: "paraphrase-practice: <url>"` plus `sourceUrl` / `license`. Prefer **patterns** over dumping worksheets.

### Skipped (unclear or non-redistributable)

- MathCat / HappyFree printables — personal use / unclear redistribution
- Generic EDB Addenda worksheet pages under the site-wide copyright notice (no explicit educational-duplication clause like the English vocab handbook)
- HKEAA past papers and commercial drill books — never ingested

## Honesty / coverage gaps

- Snippets are **learning objectives / key-stage descriptors**, not a full syllabus dump. Two-column PDF layouts do not auto-chunk perfectly, so the committed JSON is a **curated distillation** (~60–70 chunks) from fetched EDB documents, with `source` / `sourceUrl` on every chunk. Paraphrases are labeled `source: "paraphrase: <url>"`.
- Maths Number (fractions/decimals/word problems) is the strongest coverage (Annex I is compact). Chinese and English are keyed to suggested learning points / ELCG strand targets. GS maps Health / Community / Science strands onto `healthy-living`, `community`, `nature-science`; National Identity content is kept light for this POC.
- Year granularity is mostly **KS1/KS2 bands** plus a few P-year hints — not every EDB bullet per year.
- Extending coverage: inspect `_raw/*.txt` after curriculum ingest, or add practice seeds in `scripts/ingest-practice.mjs`, then `npm run ingest:practice` and `npm run verify:curriculum`. Keep topic slugs aligned with `lib/curriculum.ts`.

## Open practice grounding

In addition to EDB learning-objective chunks, quiz prompts can be mixed with **open practice-pattern** chunks (`kind: "practice"`) — short item stems / skill descriptors distilled from verified-shareable sources (not commercial textbooks, not HKEAA past papers).

### Ingest

```bash
# Merge distilled practice seeds into data/curriculum/{*,all,practice}.json
# (idempotent: replaces prior kind=practice rows, keeps objective chunks)
npm run ingest:practice

# Optional: refresh HTML/PDF snapshots under data/curriculum/_raw/practice/ (gitignored)
node scripts/ingest-practice.mjs --fetch
```

`lib/curriculum-retrieve.ts` reserves **1–2 practice slots** per retrieve (alongside EDB objective snippets) when topic/year match.

### Licences used (verified before ingest)

| Source | Licence | Use in repo |
| --- | --- | --- |
| [Illustrative Mathematics](https://tasks.illustrativemathematics.org/) tasks | CC BY-NC-SA 4.0 | Distilled fraction/decimal/word-problem patterns; attribution URL on each chunk |
| [Chinese Grammar Wiki](https://resources.allsetlearning.com/chinese/grammar/) (AllSet Learning) | CC BY-NC-SA 3.0 | Paraphrased measure-word / SVO / comparison patterns; attribution required; NC+SA |
| EDB *Enhancing English Vocabulary Learning and Teaching at Primary Level* handbook | Explicit **non-profit educational duplication** with acknowledgement | Paraphrased vocab/grammar/reading stems (Sports, Crafts, We Love Hong Kong units) |
| [Pollution in our Rivers](https://probleu.pml.space/en/content/worksheet/1335/) (Earthwatch / ProBleu) | CC BY 4.0 | Distilled freshwater / pollution / human-impact stems for 常識 |

Chunks use `source: "practice: <url>"` or `source: "paraphrase-practice: <url>"` plus `sourceUrl` / `license`. Prefer **patterns** over dumping worksheets.

### Skipped (unclear or non-redistributable)

- MathCat / HappyFree printables — personal use / unclear redistribution
- Generic EDB Addenda worksheet pages under the site-wide copyright notice (no explicit educational-duplication clause like the English vocab handbook)
- HKEAA past papers and commercial drill books — never ingested

## Honesty

Demo only. No payments, no student accounts. LLM calls use your configured API key when set.

## License

MIT (intended).
