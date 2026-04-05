import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWonDeals } from "@/lib/salesflow";
import { sendEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agencyId = session.user.agencyId;
  const agencyName = session.user.agencyName ?? "Pipeline Activation System Agency";
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  try {
    const wonDeals = await getWonDeals();

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const deal of wonDeals) {
      try {
        // Check if already exists by email or salesflowDealId
        const existing = await prisma.client.findFirst({
          where: {
            agencyId,
            OR: [{ email: deal.email }, { salesflowDealId: deal.id }],
          },
        });

        if (existing) { skipped++; continue; }

        // Create the client
        const client = await prisma.client.create({
          data: {
            agencyId,
            salesflowDealId: deal.id,
            name: deal.name,
            email: deal.email,
            company: deal.company ?? undefined,
            status: "INVITED",
            pipelineStage: "ONBOARDING",
            invitedAt: new Date(),
          },
        });

        // Send onboarding invite email
        const onboardingUrl = `${appUrl}/onboarding/${client.onboardingToken}`;
        const emailResult = await sendEmail({
          to: deal.email,
          type: "ONBOARDING_INVITE",
          data: {
            clientName: deal.name,
            clientCompany: deal.company ?? undefined,
            onboardingUrl,
            agencyName,
          },
        });

        // Log the email
        await prisma.emailLog.create({
          data: {
            clientId: client.id,
            type: "ONBOARDING_INVITE",
            subject: emailResult.subject,
            status: emailResult.success ? "SENT" : "FAILED",
          },
        });

        created++;
      } catch (err) {
        errors.push(`${deal.email}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      wonDeals: wonDeals.length,
      created,
      skipped,
      errors,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const wonDeals = await getWonDeals();
    return NextResponse.json({ wonDeals: wonDeals.length, deals: wonDeals });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
