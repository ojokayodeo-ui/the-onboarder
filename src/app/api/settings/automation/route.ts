import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  autoWelcomeEmail: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { autoWelcomeEmail } = schema.parse(body);

  await prisma.agency.update({
    where: { id: session.user.agencyId },
    data: { autoWelcomeEmail },
  });

  return NextResponse.json({ success: true, autoWelcomeEmail });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
    select: { autoWelcomeEmail: true },
  });

  return NextResponse.json(agency);
}
