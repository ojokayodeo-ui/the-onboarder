import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const sections = ["business", "offer", "audience", "competition", "marketing", "goals", "assets"] as const;

const saveSchema = z.object({
  section: z.enum(sections),
  data: z.record(z.unknown()),
  isComplete: z.boolean().optional().default(false),
  files: z.array(z.object({ name: z.string(), url: z.string(), size: z.number().optional(), mimeType: z.string().optional() })).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { onboardingToken: params.token },
      include: { responses: { select: { section: true, isComplete: true } } },
    });

    if (!client) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    if (client.status === "ONBOARDING_COMPLETED") {
      return NextResponse.json({ error: "Already completed" }, { status: 400 });
    }

    const body = await req.json();
    const { section, data, isComplete, files } = saveSchema.parse(body);

    // Upsert response
    await prisma.onboardingResponse.upsert({
      where: { clientId_section: { clientId: client.id, section } },
      update: {
        data: JSON.stringify(data),
        isComplete,
        completedAt: isComplete ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        clientId: client.id,
        section,
        data: JSON.stringify(data),
        isComplete,
        completedAt: isComplete ? new Date() : null,
      },
    });

    // Save file/link assets
    if (files && files.length > 0) {
      for (const file of files) {
        await prisma.asset.create({
          data: {
            clientId: client.id,
            type: file.url.startsWith("http") && !file.name.includes(".") ? "LINK" : "FILE",
            name: file.name,
            url: file.url,
            size: file.size,
            mimeType: file.mimeType,
          },
        });
      }
    }

    // Update client status
    const allResponses = await prisma.onboardingResponse.findMany({
      where: { clientId: client.id },
      select: { section: true, isComplete: true },
    });

    const completedSections = allResponses.filter((r) => r.isComplete).length;
    const totalSections = sections.length;
    let newStatus: string = client.status;

    if (completedSections === 0) {
      newStatus = "ONBOARDING_STARTED";
    } else if (completedSections < totalSections) {
      newStatus = "ONBOARDING_IN_PROGRESS";
    } else if (completedSections >= totalSections) {
      newStatus = "ONBOARDING_COMPLETED";
    }

    await prisma.client.update({
      where: { id: client.id },
      data: {
        status: newStatus as never,
        ...(newStatus === "ONBOARDING_COMPLETED" && { completedAt: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      progress: Math.round((completedSections / totalSections) * 100),
      completed: newStatus === "ONBOARDING_COMPLETED",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
