# HK Learn — Primary P4–P6 POC

Hong Kong primary learning demo for **中文 / English / Maths** (P4–P6).

**Live:** https://hk-primary-learn.vercel.app

**Interactive exercises** + **on-the-fly quiz generation** (mock templates + seeded random). Bilingual UI chrome: **zh-HK default** + English toggle.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Features (v0)

- Home: pick year (P4/P5/P6) + subject
- Subject hubs with 3 topics each (HK curriculum flavour)
- Interactive exercises: match pairs, fill-blank, multiple choice, number input
- Quiz generator: subject + topic + year + count → mock quiz with variety on regenerate
- Locale toggle 繁體 / EN (persists in `localStorage`)
- Optional local progress in `localStorage` (no accounts)

## Quiz generation — mock + LLM stub

`lib/quiz/generator.ts` builds quizzes from template banks with a seeded PRNG.

`lib/quiz/llm-stub.ts` exports `createQuizGenerator()` → `MockQuizGenerator`.

To swap in a real LLM later, implement `QuizGenerator` and change the factory — **quiz UI does not need a rewrite**.

## Stack

Next.js 15 App Router · TypeScript · Tailwind 4 · lightweight dictionary i18n

## Honesty

Demo only. No payments, no student accounts, no live LLM calls.

## License

MIT (intended).
