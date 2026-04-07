import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

export async function sendSequenceStep(
  clientId: string,
  stepId: string,
  agencyName: string,
  appUrl: string
): Promise<{ subject: string; body: string }> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { responses: true, aiAnalysis: true },
  });
  if (!client) throw new Error("Client not found");

  const onboardingUrl = `${appUrl}/onboarding/${client.onboardingToken}`;
  const context = client.responses
    .map((r) => { try { return `${r.section}: ${r.data}`; } catch { return ""; } })
    .filter(Boolean)
    .join("\n");

  const readinessScore = client.aiAnalysis?.readinessScore;
  const actionPlan = client.aiAnalysis?.actionPlan;

  const prompts: Record<string, string> = {
    welcome: `Write a warm, professional welcome email from ${agencyName} to their new client ${client.name} at ${client.company ?? "their company"}.
- Introduce the agency warmly and express genuine excitement about working together
- Give a brief overview of what the onboarding process looks like
- Keep it personal, not corporate. 3-4 short paragraphs.`,

    onboarding_invite: `Write an onboarding invitation email from ${agencyName} to ${client.name} at ${client.company ?? "their company"}.
Onboarding link: ${onboardingUrl}
- Explain they have a personalised onboarding form to complete (7 sections, 15-20 min)
- They can save and return at any time
- The more detail they give, the better the strategy we build
- Include the link prominently`,

    reminder: `Write a gentle reminder email from ${agencyName} to ${client.name} about their incomplete onboarding form.
Onboarding link: ${onboardingUrl}
- Be friendly and helpful, not pushy. Keep it to 2-3 sentences.`,

    onboarding_complete: `Write a congratulations email from ${agencyName} to ${client.name} who just completed their onboarding.
Client context: ${context.slice(0, 500)}
- Congratulate them warmly
- Explain next steps: team reviews everything, strategy built within 2-3 business days
- End with genuine excitement`,

    strategy_ready: `Write an email from ${agencyName} to ${client.name} telling them their strategy and AI analysis is complete.
${readinessScore ? `Readiness score: ${readinessScore}/100` : ""}
${actionPlan ? `Action plan preview: ${actionPlan.slice(0, 300)}` : ""}
- Share 1-2 key insights. Invite them to a strategy call. Build anticipation.`,

    week1_checkin: `Write a week 1 check-in email from ${agencyName} to ${client.name} (${client.company ?? ""}).
- Show you've been working on their account
- Share 1-2 early actions or findings
- Ask if they have any questions. Keep it brief and confident.`,

    growth_update: `Write an email from ${agencyName} to ${client.name} about how you'll grow together.
- Explain working process and communication rhythm
- What does success look like in 90 days?
- Be warm and visionary. Reinforce why they made the right choice.`,
  };

  const prompt = prompts[stepId];
  if (!prompt) throw new Error(`No prompt for step: ${stepId}`);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const aiRes = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 700,
    messages: [{
      role: "user",
      content: `${prompt}\n\nReturn JSON only: { "subject": "...", "body": "..." }\nBody is plain text with line breaks. No markdown.`,
    }],
  });

  const text = aiRes.content[0].type === "text" ? aiRes.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI response parse failed");
  const { subject, body } = JSON.parse(match[0]) as { subject: string; body: string };

  // Send via Resend
  if (process.env.RESEND_API_KEY) {
    const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
    const needsButton = stepId === "onboarding_invite" || stepId === "reminder";
    const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1e293b;">
      <div style="border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:28px;">
        <strong style="color:#2563eb;font-size:18px;">⚡ ${agencyName}</strong>
      </div>
      ${body.split("\n").filter(Boolean).map((l) => `<p style="margin:0 0 14px;line-height:1.7;">${l}</p>`).join("")}
      ${needsButton ? `<div style="text-align:center;margin:28px 0;"><a href="${onboardingUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">Start Your Onboarding →</a></div>` : ""}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">${agencyName} · ${new Date().getFullYear()}</div>
    </body></html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to: client.email, subject, html }),
    });
  }

  // Log
  await prisma.emailLog.create({
    data: { clientId, type: "SEQUENCE", sequenceStep: stepId, subject, status: "SENT" },
  });

  return { subject, body };
}
