import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, EmailType } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  clientId: z.string(),
  type: z.enum(["ONBOARDING_INVITE", "REMINDER", "WELCOME", "TASK_REMINDER"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { clientId, type } = schema.parse(body);

  const client = await prisma.client.findFirst({
    where: { id: clientId, agencyId: session.user.agencyId },
  });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const onboardingUrl = `${appUrl}/onboarding/${client.onboardingToken}`;

  const result = await sendEmail({
    to: client.email,
    type: type as EmailType,
    data: {
      clientName: client.name,
      clientCompany: client.company ?? undefined,
      onboardingUrl,
      agencyName: session.user.agencyName ?? undefined,
    },
  });

  await prisma.emailLog.create({
    data: {
      clientId: client.id,
      type,
      subject: result.subject,
      status: result.success ? "SENT" : "FAILED",
    },
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, subject: result.subject });
}
