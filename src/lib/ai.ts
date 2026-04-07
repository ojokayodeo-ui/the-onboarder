import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface OnboardingData {
  clientName: string;
  company: string;
  business?: Record<string, unknown>;
  offer?: Record<string, unknown>;
  audience?: Record<string, unknown>;
  competition?: Record<string, unknown>;
  marketing?: Record<string, unknown>;
  goals?: Record<string, unknown>;
}

export interface AIAnalysisResult {
  snapshot: {
    summary: string;
    keyInsights: string[];
  };
  icpProfile: {
    icp: Record<string, unknown>;
    personas: Array<Record<string, unknown>>;
  };
  offerBreakdown: {
    strength: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  competitorOverview: {
    competitors: Array<{ name: string; notes: string }>;
    positioning: string;
    opportunities: string[];
  };
  marketingAnalysis: {
    currentChannels: string[];
    messagingStrength: string;
    gaps: string[];
    recommendations: string[];
  };
  readinessScore: number;
  readinessMissing: string[];
  actionPlan: Array<{
    priority: number;
    action: string;
    category: string;
    timeframe: string;
  }>;
  inconsistencies: string[];
}

export async function analyzeOnboardingData(data: OnboardingData): Promise<AIAnalysisResult> {
  const prompt = buildAnalysisPrompt(data);

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: "You are a JSON API. You must respond with ONLY a valid JSON object. No markdown, no code fences, no explanation, no text before or after. Just the raw JSON object.",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const text = content.text.trim();

  // Try direct parse first (since we asked for raw JSON)
  try {
    return JSON.parse(text) as AIAnalysisResult;
  } catch {
    // fall through
  }

  // Try to extract from fenced block (in case model ignored instructions)
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1].trim()) as AIAnalysisResult;
    } catch {
      // fall through
    }
  }

  // Try to extract the first { ... } JSON object
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as AIAnalysisResult;
    } catch {
      // fall through
    }
  }

  // Log raw for debugging then throw
  console.error("AI raw response (unparseable):", text.slice(0, 500));
  throw new Error(`Failed to parse AI response. Raw: ${text.slice(0, 200)}`);
}

function buildAnalysisPrompt(data: OnboardingData): string {
  return `Analyze the following client onboarding data as a senior marketing strategist. Return a JSON object with exactly these keys:

CLIENT: ${data.clientName} at ${data.company}

ONBOARDING DATA:
${JSON.stringify(data, null, 2)}

Return this exact JSON structure (replace placeholder values with real analysis):
{"snapshot":{"summary":"2-3 sentence executive summary","keyInsights":["insight1","insight2","insight3","insight4","insight5"]},"icpProfile":{"icp":{"title":"Job title of ideal buyer","companySize":"size range","industry":"target industry","revenue":"revenue range","geography":"geographic focus","technographics":["tool1"],"psychographics":["trait1"]},"personas":[{"name":"nickname","title":"job title","age":"age range","goals":"primary goal","painPoints":["pain1","pain2"],"triggers":"what triggers them","objections":["objection1"],"messagingAngle":"best angle"}]},"offerBreakdown":{"strength":75,"strengths":["strength1"],"weaknesses":["weakness1"],"suggestions":["suggestion1"]},"competitorOverview":{"competitors":[{"name":"competitor","notes":"notes"}],"positioning":"positioning assessment","opportunities":["opportunity1"]},"marketingAnalysis":{"currentChannels":["channel1"],"messagingStrength":"assessment","gaps":["gap1"],"recommendations":["rec1"]},"readinessScore":70,"readinessMissing":["missing1"],"actionPlan":[{"priority":1,"action":"action","category":"Strategy","timeframe":"Week 1"}],"inconsistencies":["none"]}

Rules:
- readinessScore: 0-100 integer
- offerBreakdown.strength: 0-100 integer
- Be specific, reference actual data from the onboarding responses
- actionPlan ordered by priority, immediately actionable`;
}
