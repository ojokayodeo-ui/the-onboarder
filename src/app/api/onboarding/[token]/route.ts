import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await prisma.client.findUnique({
    where: { onboardingToken: params.token },
    include: {
      responses: true,
      assets: true,
      agency: { select: { name: true, logo: true, primaryColor: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Invalid onboarding link" }, { status: 404 });
  }

  if (client.status === "ONBOARDING_COMPLETED") {
    return NextResponse.json({ error: "Onboarding already completed", completed: true }, { status: 200 });
  }

  // Mark as started if still NEW/INVITED
  if (client.status === "NEW" || client.status === "INVITED") {
    await prisma.client.update({
      where: { id: client.id },
      data: { status: "ONBOARDING_STARTED" },
    });
  }

  return NextResponse.json({ data: client });
}
