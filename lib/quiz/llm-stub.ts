import { MockQuizGenerator } from "./generator";
import { LlmQuizGenerator } from "./llm-generator";
import type { Quiz, QuizGenerator, QuizRequest } from "./types";

export type QuizSource = "llm" | "mock";

export type QuizWithSource = Quiz & { source?: QuizSource };

/**
 * Tries the live LLM API first; on network / 503 / 502 falls back to the
 * seeded mock so the demo never bricks.
 */
class FallbackQuizGenerator implements QuizGenerator {
  private llm = new LlmQuizGenerator();
  private mock = new MockQuizGenerator();
  lastSource: QuizSource = "mock";

  async generate(request: QuizRequest): Promise<QuizWithSource> {
    const preferLlm = (process.env.NEXT_PUBLIC_QUIZ_GENERATOR ?? "llm") !== "mock";

    if (preferLlm) {
      try {
        const quiz = await this.llm.generate(request);
        this.lastSource = "llm";
        return { ...quiz, source: "llm" };
      } catch (err) {
        const status = (err as { status?: number } | null)?.status;
        // Fall back on unavailable / upstream failure / network errors.
        if (status === undefined || status === 503 || status === 502 || status >= 500) {
          console.warn("[quiz] LLM generate failed; falling back to mock", status ?? "network");
        } else {
          console.warn("[quiz] LLM generate rejected; falling back to mock", status);
        }
      }
    }

    const quiz = await this.mock.generate(request);
    this.lastSource = "mock";
    return { ...quiz, source: "mock" };
  }
}

/**
 * Factory for the quiz generator the UI talks to.
 * Prefer LLM via `/api/quiz/generate`; fall back to MockQuizGenerator.
 */
export function createQuizGenerator(): QuizGenerator {
  return new FallbackQuizGenerator();
}
