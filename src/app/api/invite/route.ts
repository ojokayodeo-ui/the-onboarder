import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { clientId } = await req.json();

    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId },
    });

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    // Update status and record invite time
    await prisma.client.update({
      where: { id: clientId },
      data: {
        status: "INVITED",
        invitedAt: new Date(),
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${client.onboardingToken}`;

    return NextResponse.json({
      success: true,
      onboardingUrl,
      message: `Onboarding link generated for ${client.name}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 });
  }
}
