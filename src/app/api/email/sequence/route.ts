import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SEQUENCE_STEPS } from "@/lib/sequences";
import { sendSequenceStep } from "@/lib/send-sequence";
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
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const agencyName = session.user.agencyName ?? "Pipeline Activation System Agency";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "";

  try {
    const result = await sendSequenceStep(clientId, stepId, agencyName, appUrl);
    return NextResponse.json({ success: true, ...result });
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
