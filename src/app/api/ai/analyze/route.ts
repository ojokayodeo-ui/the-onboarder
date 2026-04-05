import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeOnboardingData } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { clientId } = await req.json();

    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId },
      include: { responses: true },
    });

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    // Parse all section responses
    const responseMap: Record<string, Record<string, unknown>> = {};
    for (const response of client.responses) {
      try {
        responseMap[response.section] = JSON.parse(response.data) as Record<string, unknown>;
      } catch {
        responseMap[response.section] = {};
      }
    }

    const analysisInput = {
      clientName: client.name,
      company: client.company ?? client.name,
      business: responseMap.business,
      offer: responseMap.offer,
      audience: responseMap.audience,
      competition: responseMap.competition,
      marketing: responseMap.marketing,
      goals: responseMap.goals,
    };

    const result = await analyzeOnboardingData(analysisInput);

    // Save to DB
    await prisma.aIAnalysis.upsert({
      where: { clientId: client.id },
      update: {
        snapshot: JSON.stringify(result.snapshot),
        icpProfile: JSON.stringify(result.icpProfile),
        offerBreakdown: JSON.stringify(result.offerBreakdown),
        competitorOverview: JSON.stringify(result.competitorOverview),
        marketingAnalysis: JSON.stringify(result.marketingAnalysis),
        readinessScore: result.readinessScore,
        readinessMissing: JSON.stringify(result.readinessMissing),
        actionPlan: JSON.stringify(result.actionPlan),
        inconsistencies: JSON.stringify(result.inconsistencies),
        updatedAt: new Date(),
      },
      create: {
        clientId: client.id,
        snapshot: JSON.stringify(result.snapshot),
        icpProfile: JSON.stringify(result.icpProfile),
        offerBreakdown: JSON.stringify(result.offerBreakdown),
        competitorOverview: JSON.stringify(result.competitorOverview),
        marketingAnalysis: JSON.stringify(result.marketingAnalysis),
        readinessScore: result.readinessScore,
        readinessMissing: JSON.stringify(result.readinessMissing),
        actionPlan: JSON.stringify(result.actionPlan),
        inconsistencies: JSON.stringify(result.inconsistencies),
      },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
