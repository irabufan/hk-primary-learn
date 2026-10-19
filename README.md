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

## Honesty

Demo only. No payments, no student accounts. LLM calls use your configured API key when set.

## License

MIT (intended).
