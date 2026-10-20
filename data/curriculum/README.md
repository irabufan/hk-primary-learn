# Curriculum chunks (file-backed)

Static JSON learning-target snippets for quiz LLM grounding. No database.

- `all.json` — full set (imported by `lib/curriculum-retrieve.ts`)
- `{chinese,english,maths,gs}.json` — per-subject splits
- `manifest.json` — counts + source URLs from last ingest

Refresh:

```bash
npm run ingest:curriculum
npm run verify:curriculum
```

See root README “Curriculum grounding” for retrieve semantics and coverage honesty.
