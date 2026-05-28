import type { JudgeProvider } from "./types";
import { mockJudgeProvider } from "./mock-judge";

export * from "./types";

const PROVIDER = process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock";

export function getJudgeProvider(): JudgeProvider {
  switch (PROVIDER) {
    case "mock":
      return mockJudgeProvider;
    default:
      return mockJudgeProvider;
  }
}
