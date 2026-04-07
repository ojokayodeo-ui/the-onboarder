import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { subDays, format, eachDayOfInterval, startOfDay } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId = session.user.agencyId;

  const [clients, tasks, messages, emailLogs] = await Promise.all([
    prisma.client.findMany({
      where: { agencyId },
      include: { aiAnalysis: { select: { readinessScore: true } }, responses: { select: { isComplete: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({ where: { client: { agencyId } } }),
    prisma.message.findMany({ where: { client: { agencyId } }, orderBy: { sentAt: "asc" } }),
    prisma.emailLog.findMany({ where: { client: { agencyId } } }),
  ]);

  // Pipeline stage distribution
  const stageCounts: Record<string, number> = {};
  for (const c of clients) {
    stageCounts[c.pipelineStage] = (stageCounts[c.pipelineStage] ?? 0) + 1;
  }
  const pipelineData = Object.entries(stageCounts).map(([stage, count]) => ({
    stage: stage.replace(/_/g, " "),
    count,
  }));

  // Status distribution
  const statusCounts: Record<string, number> = {};
  for (const c of clients) {
    statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
  }

  // Readiness score distribution
  const scoreBuckets = [
    { range: "0–20", min: 0, max: 20, count: 0 },
    { range: "21–40", min: 21, max: 40, count: 0 },
    { range: "41–60", min: 41, max: 60, count: 0 },
    { range: "61–80", min: 61, max: 80, count: 0 },
    { range: "81–100", min: 81, max: 100, count: 0 },
  ];
  for (const c of clients) {
    const score = c.aiAnalysis?.readinessScore;
    if (score != null) {
      const bucket = scoreBuckets.find(b => score >= b.min && score <= b.max);
      if (bucket) bucket.count++;
    }
  }

  // Client acquisition over last 30 days
  const thirtyDaysAgo = subDays(new Date(), 29);
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
  const acquisitionMap: Record<string, number> = {};
  for (const day of days) acquisitionMap[format(day, "MMM d")] = 0;
  for (const c of clients) {
    const day = format(startOfDay(c.createdAt), "MMM d");
    if (acquisitionMap[day] !== undefined) acquisitionMap[day]++;
  }
  const acquisitionData = Object.entries(acquisitionMap).map(([date, count]) => ({ date, count }));

  // Onboarding completion rate
  const completed = clients.filter(c => c.status === "ONBOARDING_COMPLETED").length;
  const invited = clients.filter(c => c.status !== "NEW").length;
  const completionRate = invited > 0 ? Math.round((completed / invited) * 100) : 0;

  // Average readiness score
  const scores = clients.map(c => c.aiAnalysis?.readinessScore).filter((s): s is number => s != null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Task stats
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "TODO").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done: tasks.filter(t => t.status === "DONE").length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "DONE").length,
  };

  // Email stats
  const emailStats = {
    total: emailLogs.length,
    invites: emailLogs.filter(e => e.type === "ONBOARDING_INVITE").length,
    reminders: emailLogs.filter(e => e.type === "REMINDER").length,
    welcome: emailLogs.filter(e => e.type === "WELCOME").length,
  };

  // Messages over time (last 30 days)
  const msgMap: Record<string, number> = {};
  for (const day of days) msgMap[format(day, "MMM d")] = 0;
  for (const m of messages) {
    const day = format(startOfDay(m.sentAt), "MMM d");
    if (msgMap[day] !== undefined) msgMap[day]++;
  }
  const messageData = Object.entries(msgMap).map(([date, count]) => ({ date, count }));

  // Onboarding section completion rates
  const sectionIds = ["business", "offer", "audience", "competition", "marketing", "goals", "assets"];
  const sectionData = sectionIds.map(section => {
    const total = clients.length;
    const done = clients.filter(c => c.responses.some(r => r.isComplete)).length;
    return { section: section.charAt(0).toUpperCase() + section.slice(1), completion: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  return NextResponse.json({
    summary: {
      totalClients: clients.length,
      completionRate,
      avgScore,
      activeClients: clients.filter(c => ["ONBOARDING_STARTED", "ONBOARDING_IN_PROGRESS", "ACTIVE"].includes(c.status)).length,
    },
    pipelineData,
    statusCounts,
    scoreBuckets,
    acquisitionData,
    taskStats,
    emailStats,
    messageData,
    sectionData,
  });
}
