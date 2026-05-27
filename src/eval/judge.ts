import Anthropic from "@anthropic-ai/sdk";
import type { Report } from "../schema.ts";

const JUDGE_MODEL = "claude-haiku-4-5-20251001";
const JUDGE_DIMENSIONS = [
  "recipe_fidelity",
  "audience_match",
  "image_prompt_quality",
  "overall_craft",
] as const;

export type JudgeScore = {
  recipe_fidelity: number;
  audience_match: number;
  image_prompt_quality: number;
  overall_craft: number;
  notes: string;
};

export type JudgeResult = {
  passed: boolean;
  threshold: number;
  score: JudgeScore;
  failures: string[];
};

const RUBRIC = `You are grading a hand-drawn-style HTML report against its
specification. Score each dimension on an integer 1–5 scale:

1 = broken / off-spec
2 = below expectations
3 = meets expectations
4 = above expectations
5 = exemplary

Dimensions:
- recipe_fidelity — does the section order + node types match the report
  type's recipe?
- audience_match — does the prose tone match the audience modifier
  (engineers terse, non-tech warm/analogy-heavy, etc.)?
- image_prompt_quality — do figure captions and alt-text suggest images
  that actually carry the section's information?
- overall_craft — is this a report you'd be proud to ship?

Respond with a single JSON object and nothing else:
{"recipe_fidelity": 1-5, "audience_match": 1-5, "image_prompt_quality": 1-5, "overall_craft": 1-5, "notes": "one sentence"}`;

export async function judge(
  report: Report,
  expectedType: string,
  expectedAudience: string,
  threshold = 3,
): Promise<JudgeResult> {
  const client = new Anthropic();
  const payload = JSON.stringify(report, null, 2);

  const message = await client.messages.create({
    model: JUDGE_MODEL,
    max_tokens: 400,
    system: [
      {
        type: "text",
        text: RUBRIC,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Expected type: ${expectedType}\nExpected audience: ${expectedAudience}\n\nReport JSON:\n${payload}`,
      },
    ],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`judge returned no JSON: ${text.slice(0, 200)}`);
  const score = JSON.parse(jsonMatch[0]) as JudgeScore;

  const failures: string[] = [];
  for (const dim of JUDGE_DIMENSIONS) {
    if (score[dim] < threshold) {
      failures.push(`${dim}=${score[dim]} below threshold ${threshold}`);
    }
  }

  return { passed: failures.length === 0, threshold, score, failures };
}
