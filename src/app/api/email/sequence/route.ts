import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SEQUENCE_STEPS } from "@/lib/sequences";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const schema = z.object({
  clientId: z.string(),
  stepId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { clientId, stepId } = schema.parse(body);

  const step = SEQUENCE_STEPS.find(s => s.id === stepId);
  if (!step) return NextResponse.json({ error: "Invalid step" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { id: clientId, agencyId: session.user.agencyId },
    include: { responses: true, aiAnalysis: true },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const agencyName = session.user.agencyName ?? "Pipeline Activation System Agency";
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const onboardingUrl = `${appUrl}/onboarding/${client.onboardingToken}`;

  // Build context from onboarding responses
  const context = client.responses.map(r => {
    try { return `${r.section}: ${r.data}`; } catch { return ""; }
  }).filter(Boolean).join("\n");

  const readinessScore = client.aiAnalysis?.readinessScore;
  const actionPlan = client.aiAnalysis?.actionPlan;

  // Step-specific prompts
  const prompts: Record<string, string> = {
    welcome: `Write a warm, professional welcome email from ${agencyName} to their new client ${client.name} at ${client.company ?? "their company"}.
- Introduce the agency warmly
- Express genuine excitement about working together
- Give a brief overview of what the onboarding process looks like
- Keep it personal, not corporate
- 3-4 short paragraphs`,

    onboarding_invite: `Write an onboarding invitation email from ${agencyName} to ${client.name} at ${client.company ?? "their company"}.
Onboarding link: ${onboardingUrl}
- Explain they have a personalised onboarding form to complete
- The form has 7 sections and takes about 15-20 minutes
- They can save and return at any time
- The more detail they give, the better the strategy we build
- Include the link prominently`,

    reminder: `Write a gentle reminder email from ${agencyName} to ${client.name} about their incomplete onboarding form.
Onboarding link: ${onboardingUrl}
- Be friendly and helpful, not pushy
- Acknowledge they're probably busy
- Remind them they can save progress and return
- Keep it short — 2-3 sentences max`,

    onboarding_complete: `Write a congratulations email from ${agencyName} to ${client.name} who just completed their onboarding.
Client context: ${context.slice(0, 500)}
- Congratulate them warmly
- Explain what happens next: the team reviews everything and builds their strategy
- Give a timeline (e.g., strategy ready within 2-3 business days)
- End with excitement about getting started`,

    strategy_ready: `Write an email from ${agencyName} to ${client.name} telling them their strategy and AI analysis is complete.
Client context: ${context.slice(0, 500)}
${readinessScore ? `Readiness score: ${readinessScore}/100` : ""}
${actionPlan ? `Action plan preview: ${actionPlan.slice(0, 300)}` : ""}
- Share 1-2 key insights you found
- Invite them to a strategy call to review everything
- Build anticipation — make them excited to see the full plan`,

    week1_checkin: `Write a week 1 check-in email from ${agencyName} to ${client.name}.
Client: ${client.company ?? client.name}
Context: ${context.slice(0, 400)}
- Show you've been working on their account
- Share 1-2 early actions or findings
- Ask if they have any questions
- Keep it brief and confident`,

    growth_update: `Write an email from ${agencyName} to ${client.name} about how you'll grow together.
Client: ${client.company ?? client.name}
- Explain your working process and communication rhythm
- What does success look like in 90 days?
- How will you communicate progress?
- Reinforce why they made the right choice
- Be warm and visionary`,
  };

  const prompt = prompts[stepId];
  if (!prompt) return NextResponse.json({ error: "No prompt for this step" }, { status: 400 });

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const aiRes = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 700,
      messages: [{
        role: "user",
        content: `${prompt}\n\nReturn JSON: { "subject": "...", "body": "..." }\nBody is plain text with line breaks. No markdown. Warm and professional tone.`,
      }],
    });

    const text = aiRes.content[0].type === "text" ? aiRes.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI response parse failed");
    const { subject, body } = JSON.parse(match[0]);

    // Send email if Resend configured
    if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
      const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1e293b;">
        <div style="border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:28px;">
          <strong style="color:#6366f1;font-size:18px;">⚡ ${agencyName}</strong>
        </div>
        ${body.split("\n").filter(Boolean).map((l: string) => `<p style="margin:0 0 14px;line-height:1.7;">${l}</p>`).join("")}
        ${stepId === "onboarding_invite" || stepId === "reminder" ? `<div style="text-align:center;margin:28px 0;"><a href="${onboardingUrl}" style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">Start Your Onboarding →</a></div>` : ""}
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">${agencyName} · ${new Date().getFullYear()}</div>
      </body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromEmail, to: client.email, subject, html }),
      });
    }

    // Log it
    await prisma.emailLog.create({
      data: {
        clientId,
        type: "SEQUENCE",
        sequenceStep: stepId,
        subject,
        status: "SENT",
      },
    });

    return NextResponse.json({ success: true, subject, body });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Get sent sequence steps for a client
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const logs = await prisma.emailLog.findMany({
    where: { clientId, type: "SEQUENCE" },
    orderBy: { sentAt: "asc" },
  });

  return NextResponse.json(logs);
}
