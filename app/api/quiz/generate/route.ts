import { NextResponse } from "next/server";
import {
  buildQuizPrompt,
  callOpenCodeGoChat,
  getOpenCodeGoConfig,
  isValidSubject,
  isValidYear,
  parseQuizQuestions,
  toQuiz,
} from "@/lib/quiz/opencode-go";
import { QUIZ_COUNTS, type QuizRequest } from "@/lib/quiz/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  subject?: unknown;
  topic?: unknown;
  year?: unknown;
  count?: unknown;
  seed?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message, code: "bad_request" }, { status: 400 });
}

export async function POST(request: Request) {
  const { apiKey } = getOpenCodeGoConfig();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "OPENCODE_GO_API_KEY is not configured on the server",
        code: "llm_unavailable",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!isValidSubject(body.subject)) {
    return badRequest("subject must be chinese | english | maths");
  }
  if (typeof body.topic !== "string" || !body.topic.trim()) {
    return badRequest("topic is required");
  }
  if (!isValidYear(body.year)) {
    return badRequest("year must be P4 | P5 | P6");
  }

  const countNum = typeof body.count === "number" ? body.count : Number(body.count);
  const count = (QUIZ_COUNTS as readonly number[]).includes(countNum) ? countNum : QUIZ_COUNTS[0];

  const seedRaw = body.seed === undefined ? Date.now() % 0x7fffffff : Number(body.seed);
  const seed = Number.isFinite(seedRaw) ? Math.abs(Math.floor(seedRaw)) : Date.now() % 0x7fffffff;

  const quizRequest: QuizRequest = {
    subject: body.subject,
    topic: body.topic.trim(),
    year: body.year,
    count,
    seed,
  };

  const { system, user } = buildQuizPrompt(quizRequest);
  const sessionId = `ses-hklearn-${quizRequest.subject}-${quizRequest.topic}-${seed}`;

  try {
    const { content, model } = await callOpenCodeGoChat(system, user, sessionId);
    const questions = parseQuizQuestions(content, count);
    const quiz = toQuiz(quizRequest, questions);
    return NextResponse.json({
      quiz,
      source: "llm" as const,
      model,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM generation failed";
    // Avoid leaking anything that looks like a secret.
    const safe = message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 240);
    console.error("[quiz/generate]", safe);
    return NextResponse.json(
      { error: safe || "LLM generation failed", code: "llm_failed" },
      { status: 502 },
    );
  }
}
