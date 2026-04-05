import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  pipelineStage: z.enum(["NEW_CLIENT", "ONBOARDING", "STRATEGY", "EXECUTION"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const stage = searchParams.get("stage");
  const search = searchParams.get("search");

  const clients = await prisma.client.findMany({
    where: {
      agencyId: session.user.agencyId,
      ...(status && { status: status as never }),
      ...(stage && { pipelineStage: stage as never }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { company: { contains: search } },
        ],
      }),
    },
    include: {
      responses: { select: { section: true, isComplete: true } },
      aiAnalysis: { select: { readinessScore: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: clients });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...data,
        agencyId: session.user.agencyId,
        onboardingToken: uuidv4(),
        status: "NEW",
        pipelineStage: data.pipelineStage ?? "NEW_CLIENT",
      },
    });

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
