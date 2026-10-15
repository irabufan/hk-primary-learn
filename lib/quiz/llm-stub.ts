/**
 * Quiz generator factory.
 *
 * v0 returns MockQuizGenerator (templates + seeded random).
 *
 * To swap in a real LLM later:
 * 1. Implement QuizGenerator that POSTs GenerateOpts to your API
 * 2. Map the JSON response to Quiz / QuizQuestion
 * 3. Change createQuizGenerator() to return that class
 * The /quiz UI and QuizPlayer stay unchanged.
 */
import type { QuizGenerator } from "@/lib/quiz/types";
import { MockQuizGenerator } from "@/lib/quiz/generator";

export function createQuizGenerator(): QuizGenerator {
  // TODO: return new LlmQuizGenerator({ endpoint: "/api/quiz", model: "..." })
  return new MockQuizGenerator();
}
