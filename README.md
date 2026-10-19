# HK Learn — Primary P1–P6 POC

Hong Kong primary learning demo for **中文 / English / Maths** (P1–P6).

**Live:** https://hk-primary-learn.vercel.app

**Interactive exercises** + **on-the-fly quiz generation** (OpenCode Go LLM with seeded mock fallback). Bilingual UI chrome: **zh-HK default** + English toggle.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Live LLM quiz generation (OpenCode Go)

Quizzes call OpenCode Go (`deepseek-v4.1-flash` by default) via a server route. The API key never reaches the browser. If the key is missing or the call fails, the app falls back to the seeded mock generator.

### Env vars (names only)

| Variable | Where | Purpose |
| --- | --- | --- |
| `OPENCODE_GO_API_KEY` | server (`.env.local` / Vercel) | Bearer token for OpenCode Go |
| `OPENCODE_GO_MODEL` | server (optional) | Model id, default `deepseek-v4.1-flash` |
| `OPENCODE_GO_BASE_URL` | server (optional) | Default `https://opencode.ai/zen/go/v1` |
| `NEXT_PUBLIC_QUIZ_GENERATOR` | client (optional) | `llm` (default) or `mock` to force mock |

### Local setup (do not commit secrets)

`.env*` is gitignored. Create `.env.local` from your OpenCode Go env file:

```bash
set -a && source ~/.config/opencode/go.env && set +a
printf 'OPENCODE_GO_API_KEY=%s\nOPENCODE_GO_MODEL=deepseek-v4.1-flash\nNEXT_PUBLIC_QUIZ_GENERATOR=llm\n' "$OPENCODE_GO_API_KEY" > .env.local
```

### Architecture

- Interface: `QuizGenerator` in `lib/quiz/types.ts`
- Mock: `lib/quiz/generator.ts` (`MockQuizGenerator`)
- Client adapter: `lib/quiz/llm-generator.ts` posts to `/api/quiz/generate`
- Server: `app/api/quiz/generate/route.ts` talks to OpenCode Go chat completions
- Factory: `lib/quiz/llm-stub.ts` tries LLM, falls back to mock

OpenCode Go notes: send `Authorization: Bearer …`, a stable `x-opencode-session` header, and a custom `User-Agent` (this app uses `hk-primary-learn/0.1`).

## Features (v0)

- Home: pick year (P1–P6) + subject
- Subject hubs with 3 topics each (HK curriculum flavour)
- Interactive exercises: match pairs, fill-blank, multiple choice, number input
- Quiz generator: subject + topic + year + count → live LLM or mock
- Locale toggle 繁體 / EN (persists in `localStorage`)
- Optional local progress in `localStorage` (no accounts)

## Stack

Next.js 15 App Router · TypeScript · Tailwind 4 · lightweight dictionary i18n · OpenCode Go

## Honesty

Demo only. No payments, no student accounts. LLM calls use your OpenCode Go key when configured.

## License

MIT (intended).
