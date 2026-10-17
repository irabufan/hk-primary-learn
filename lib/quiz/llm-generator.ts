import type { Quiz, QuizGenerator, QuizRequest } from "./types";

export type QuizGenerateResponse = {
  quiz: Quiz;
  source: "llm";
  model?: string;
};

/**
 * Client-side adapter: POSTs to the server route that talks to OpenCode Go.
 * The API key never leaves the server.
 */
export class LlmQuizGenerator implements QuizGenerator {
  async generate(request: QuizRequest): Promise<Quiz> {
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        subject: request.subject,
        topic: request.topic,
        year: request.year,
        count: request.count,
        seed: request.seed,
        ...(request.avoidPrompts?.length
          ? { avoidPrompts: request.avoidPrompts }
          : {}),
      }),
    });

    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      const error =
        payload &&
        typeof payload === "object" &&
        typeof (payload as { error?: unknown }).error === "string"
          ? (payload as { error: string }).error
          : `Quiz API HTTP ${res.status}`;
      const err = new Error(error) as Error & { status?: number; code?: string };
      err.status = res.status;
      if (
        payload &&
        typeof payload === "object" &&
        typeof (payload as { code?: unknown }).code === "string"
      ) {
        err.code = (payload as { code: string }).code;
      }
      throw err;
    }

    const quiz =
      payload &&
      typeof payload === "object" &&
      (payload as { quiz?: unknown }).quiz &&
      typeof (payload as { quiz: unknown }).quiz === "object"
        ? ((payload as { quiz: Quiz }).quiz)
        : null;

    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      throw new Error("Quiz API returned an empty quiz");
    }

    return quiz;
  }
}
