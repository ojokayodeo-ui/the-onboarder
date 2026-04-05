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
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Extract JSON from response
  const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    // Try to parse the entire response as JSON
    try {
      return JSON.parse(content.text) as AIAnalysisResult;
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  return JSON.parse(jsonMatch[1]) as AIAnalysisResult;
}

function buildAnalysisPrompt(data: OnboardingData): string {
  return `You are a senior marketing strategist and business analyst. Analyze the following client onboarding data and produce a comprehensive, actionable analysis.

CLIENT: ${data.clientName} at ${data.company}

ONBOARDING DATA:
${JSON.stringify(data, null, 2)}

Produce a thorough analysis in the following JSON format. Be specific, actionable, and honest about weaknesses.

\`\`\`json
{
  "snapshot": {
    "summary": "2-3 sentence executive summary of the business and their current situation",
    "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]
  },
  "icpProfile": {
    "icp": {
      "title": "Job title of ideal buyer",
      "companySize": "Company size range",
      "industry": "Target industry",
      "revenue": "Revenue range",
      "geography": "Geographic focus",
      "technographics": ["tool1", "tool2"],
      "psychographics": ["trait1", "trait2"]
    },
    "personas": [
      {
        "name": "Persona nickname",
        "title": "Job title",
        "age": "Age range",
        "goals": "Primary professional goal",
        "painPoints": ["pain1", "pain2", "pain3"],
        "triggers": "What triggers them to seek a solution",
        "objections": ["objection1", "objection2"],
        "messagingAngle": "Best angle to reach this persona"
      }
    ]
  },
  "offerBreakdown": {
    "strength": 75,
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  },
  "competitorOverview": {
    "competitors": [
      {"name": "Competitor name", "notes": "Brief competitive notes"}
    ],
    "positioning": "Assessment of their current market positioning",
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "marketingAnalysis": {
    "currentChannels": ["channel1", "channel2"],
    "messagingStrength": "Assessment of their current messaging",
    "gaps": ["gap1", "gap2"],
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  },
  "readinessScore": 70,
  "readinessMissing": ["missing item 1", "missing item 2"],
  "actionPlan": [
    {
      "priority": 1,
      "action": "Specific action to take",
      "category": "Content | Research | Analytics | Outreach | Strategy",
      "timeframe": "Week 1 | Week 2-3 | Month 1 | Month 2-3"
    }
  ],
  "inconsistencies": ["inconsistency 1 if any"]
}
\`\`\`

Rules:
- readinessScore: 0-100 based on completeness and quality of data provided
- offerBreakdown.strength: 0-100 based on offer clarity, differentiation, and market fit
- Be specific and reference actual data from the onboarding responses
- If data is missing for a section, note it in readinessMissing and adjust score accordingly
- Action plan should be ordered by priority and immediately actionable
- Inconsistencies should flag any contradictions or misalignments in the data`;
}
