import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  clientId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.enum(["CLIENT", "AGENCY"]).default("AGENCY"),
  dueDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const assignedTo = searchParams.get("assignedTo");

  const tasks = await prisma.task.findMany({
    where: {
      client: { agencyId: session.user.agencyId },
      ...(clientId ? { clientId } : {}),
      ...(assignedTo ? { assignedTo } : {}),
    },
    include: { client: { select: { id: true, name: true, company: true } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = createSchema.parse(body);

  // Verify client belongs to agency
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, agencyId: session.user.agencyId },
  });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const task = await prisma.task.create({
    data: {
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: { client: { select: { id: true, name: true, company: true } } },
  });

  return NextResponse.json(task, { status: 201 });
}
