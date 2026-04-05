import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { clientId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findFirst({
    where: { id: params.clientId, agencyId: session.user.agencyId },
    include: {
      responses: true,
      aiAnalysis: true,
      assets: true,
    },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build structured export data
  const responseMap: Record<string, unknown> = {};
  for (const r of client.responses) {
    try {
      responseMap[r.section] = JSON.parse(r.data);
    } catch {
      responseMap[r.section] = {};
    }
  }

  const parseField = (val: string | null) => {
    if (!val) return null;
    try { return JSON.parse(val); } catch { return null; }
  };

  const exportData = {
    exportedAt: new Date().toISOString(),
    agency: session.user.agencyName,
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      status: client.status,
      pipelineStage: client.pipelineStage,
      createdAt: client.createdAt,
      completedAt: client.completedAt,
    },
    onboardingData: responseMap,
    assets: client.assets.map((a) => ({ type: a.type, name: a.name, url: a.url })),
    analysis: client.aiAnalysis
      ? {
          readinessScore: client.aiAnalysis.readinessScore,
          snapshot: parseField(client.aiAnalysis.snapshot),
          icpProfile: parseField(client.aiAnalysis.icpProfile),
          offerBreakdown: parseField(client.aiAnalysis.offerBreakdown),
          competitorOverview: parseField(client.aiAnalysis.competitorOverview),
          marketingAnalysis: parseField(client.aiAnalysis.marketingAnalysis),
          readinessMissing: parseField(client.aiAnalysis.readinessMissing),
          actionPlan: parseField(client.aiAnalysis.actionPlan),
          processedAt: client.aiAnalysis.processedAt,
        }
      : null,
  };

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";

  if (format === "json") {
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${client.company ?? client.name}-onboarding.json"`,
      },
    });
  }

  return NextResponse.json({ data: exportData });
}
