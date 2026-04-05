import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type EmailType = "ONBOARDING_INVITE" | "REMINDER" | "WELCOME" | "TASK_REMINDER";

interface EmailData {
  clientName: string;
  clientCompany?: string;
  onboardingUrl?: string;
  taskTitle?: string;
  taskDueDate?: string;
  agencyName?: string;
}

// AI-generated email content
async function generateEmailContent(type: EmailType, data: EmailData): Promise<{ subject: string; html: string }> {
  const agency = data.agencyName ?? "Pipeline Activation System Agency";

  const prompts: Record<EmailType, string> = {
    ONBOARDING_INVITE: `Write a warm, professional onboarding invitation email for a new client.
Agency: ${agency}
Client name: ${data.clientName}
Company: ${data.clientCompany ?? "their company"}
Onboarding link: ${data.onboardingUrl}

The email should:
- Welcome them warmly as a new client
- Explain the onboarding process is a short guided form (7 steps)
- Emphasize the link takes them to a personalized onboarding wizard
- Set expectation: takes 15-20 minutes, they can save and return
- End with excitement about working together
- Be concise but warm (not too salesy)

Return JSON: { "subject": "...", "body": "..." } (body is plain text with line breaks)`,

    REMINDER: `Write a gentle reminder email for a client who hasn't completed their onboarding form.
Agency: ${agency}
Client name: ${data.clientName}
Onboarding link: ${data.onboardingUrl}

The email should:
- Be friendly, not pushy
- Remind them they have an onboarding form waiting
- Mention they can save progress and return
- Keep it short (3-4 sentences)

Return JSON: { "subject": "...", "body": "..." }`,

    WELCOME: `Write a welcome email for a client who just completed their onboarding.
Agency: ${agency}
Client name: ${data.clientName}
Company: ${data.clientCompany ?? "their company"}

The email should:
- Congratulate them on completing onboarding
- Explain what happens next (agency reviews their info, builds their strategy)
- Set expectations for the first week
- Express genuine excitement about growing together
- End with a clear next step (e.g. strategy call)

Return JSON: { "subject": "...", "body": "..." }`,

    TASK_REMINDER: `Write a brief task reminder email.
Agency: ${agency}
Client name: ${data.clientName}
Task: ${data.taskTitle}
Due: ${data.taskDueDate ?? "soon"}

Keep it very short — 2-3 sentences max. Friendly but clear.

Return JSON: { "subject": "...", "body": "..." }`,
  };

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompts[type] }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to generate email content");

  const parsed = JSON.parse(jsonMatch[0]);

  // Convert plain text body to simple HTML
  const html = buildHtml(parsed.body, data);

  return { subject: parsed.subject, html };
}

function buildHtml(body: string, data: EmailData): string {
  const agency = data.agencyName ?? "Pipeline Activation System Agency";
  const lines = body.split("\n").filter(Boolean).map((l: string) => `<p style="margin:0 0 12px;line-height:1.6;">${l}</p>`).join("");

  const ctaButton = data.onboardingUrl
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${data.onboardingUrl}" style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          Start Your Onboarding →
        </a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#6366f1;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
            <span style="color:#fff;font-size:20px;font-weight:700;">⚡ ${agency}</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:40px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            ${lines}
            ${ctaButton}
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
            <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
              ${agency} · Questions? Reply to this email
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(params: {
  to: string;
  type: EmailType;
  data: EmailData;
}): Promise<{ success: boolean; subject: string; error?: string }> {
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — email not sent");
    return { success: false, subject: "", error: "RESEND_API_KEY not configured" };
  }

  try {
    const { subject, html } = await generateEmailContent(params.type, params.data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, subject, error: err };
    }

    return { success: true, subject };
  } catch (err) {
    return { success: false, subject: "", error: String(err) };
  }
}
