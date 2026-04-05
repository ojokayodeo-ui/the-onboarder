import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { id: params.id, agencyId: session.user.agencyId },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const note = await prisma.note.create({
    data: { clientId: client.id, content, authorId: session.user.id },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ data: note }, { status: 201 });
}
