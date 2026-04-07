import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const sendSchema = z.object({
  clientId: z.string(),
  subject: z.string().min(1),
  body: z.string().min(1),
  aiAssisted: z.boolean().optional().default(false),
});

const draftSchema = z.object({
  clientId: z.string(),
  prompt: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { id: clientId, agencyId: session.user.agencyId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { clientId },
    orderBy: { sentAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Draft mode — AI writes the message
  if (body.draft) {
    const { clientId, prompt } = draftSchema.parse(body);
    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId },
      include: { responses: true, aiAnalysis: true },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const agencyName = session.user.agencyName ?? "Pipeline Activation System Agency";

    const context = client.responses.map(r => {
      try { return `${r.section}: ${JSON.stringify(JSON.parse(r.data))}`; } catch { return ""; }
    }).join("\n");

    const aiRes = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `You are writing an email on behalf of ${agencyName} to their client ${client.name} (${client.company ?? ""}).

Client context:
${context}

Task: ${prompt}

Write a professional, warm, and concise email. Return JSON: { "subject": "...", "body": "..." }
Body should be plain text with line breaks. Do not use markdown.`,
      }],
    });

    const text = aiRes.content[0].type === "text" ? aiRes.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "AI failed to generate draft" }, { status: 500 });
    const parsed = JSON.parse(match[0]);
    return NextResponse.json({ subject: parsed.subject, body: parsed.body });
  }

  // Send mode
  const data = sendSchema.parse(body);
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, agencyId: session.user.agencyId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Send via Resend if configured
  if (process.env.RESEND_API_KEY) {
    const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
    const agencyName = session.user.agencyName ?? "Pipeline Activation System Agency";
    const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1e293b;">
      <div style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px;">
        <strong style="color:#6366f1;">⚡ ${agencyName}</strong>
      </div>
      ${data.body.split("\n").filter(Boolean).map((l: string) => `<p style="margin:0 0 12px;line-height:1.6;">${l}</p>`).join("")}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">${agencyName}</div>
    </body></html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to: client.email, subject: data.subject, html }),
    });
  }

  const message = await prisma.message.create({
    data: {
      clientId: data.clientId,
      direction: "OUTBOUND",
      subject: data.subject,
      body: data.body,
      aiAssisted: data.aiAssisted,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
