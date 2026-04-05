import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, TrendingUp, CheckCircle2, Clock, ArrowRight, Plus, Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { statusLabel, statusColor, formatDateRelative, calculateOnboardingProgress, scoreColor, scoreLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const agencyId = session!.user.agencyId;

  const [totalClients, completedCount, inProgressCount, recentClients, allAnalyses] = await Promise.all([
    prisma.client.count({ where: { agencyId } }),
    prisma.client.count({ where: { agencyId, status: "ONBOARDING_COMPLETED" } }),
    prisma.client.count({ where: { agencyId, status: { in: ["ONBOARDING_STARTED", "ONBOARDING_IN_PROGRESS"] } } }),
    prisma.client.findMany({
      where: { agencyId },
      include: {
        responses: { select: { section: true, isComplete: true } },
        aiAnalysis: { select: { readinessScore: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.aIAnalysis.findMany({
      where: { client: { agencyId } },
      select: { readinessScore: true },
    }),
  ]);

  const avgScore = allAnalyses.length > 0
    ? Math.round(allAnalyses.reduce((sum, a) => sum + (a.readinessScore ?? 0), 0) / allAnalyses.length)
    : 0;

  const newThisMonth = await prisma.client.count({
    where: {
      agencyId,
      createdAt: { gte: new Date(new Date().setDate(1)) },
    },
  });

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "text-brand-600 bg-brand-50", delta: `+${newThisMonth} this month` },
    { label: "Onboarding Done", value: completedCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50", delta: `${totalClients > 0 ? Math.round((completedCount / totalClients) * 100) : 0}% completion rate` },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-amber-600 bg-amber-50", delta: "Awaiting completion" },
    { label: "Avg. Readiness", value: avgScore > 0 ? `${avgScore}` : "N/A", icon: TrendingUp, color: "text-violet-600 bg-violet-50", delta: avgScore > 0 ? scoreLabel(avgScore) : "No analyses yet" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {session?.user.name?.split(" ")[0] ?? "there"} 👋</p>
        </div>
        <Link href="/clients">
          <Button>
            <Plus size={16} />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, delta }) => (
          <Card key={label}>
            <CardBody className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
              <div className="text-sm font-medium text-slate-700">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{delta}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-slate-100">
              {recentClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-700 mb-1">No clients yet</h3>
                  <p className="text-sm text-slate-500 mb-4">Add your first client to get started</p>
                  <Link href="/clients">
                    <Button size="sm">
                      <Plus size={14} />
                      Add first client
                    </Button>
                  </Link>
                </div>
              ) : (
                recentClients.map((client) => {
                  const progress = calculateOnboardingProgress(client.responses);
                  const score = client.aiAnalysis?.readinessScore;
                  return (
                    <Link key={client.id} href={`/clients/${client.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <Avatar name={client.company ?? client.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-slate-900 truncate">{client.company ?? client.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(client.status)}`}>
                            {statusLabel(client.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} size="sm" className="w-24" />
                          <span className="text-xs text-slate-400">{progress}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {score != null ? (
                          <span className={`text-sm font-bold px-2 py-1 rounded-lg ${scoreColor(score)}`}>{score}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                        <div className="text-xs text-slate-400 mt-1">{formatDateRelative(client.createdAt)}</div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-4">Quick actions</h2>
          <div className="space-y-3">
            {[
              { href: "/clients", icon: Plus, label: "Add new client", sub: "Create and send onboarding link", color: "bg-brand-50 text-brand-700" },
              { href: "/pipeline", icon: TrendingUp, label: "View pipeline", sub: "Track client progress stages", color: "bg-violet-50 text-violet-700" },
              { href: "/settings", icon: Zap, label: "Customize forms", sub: "Edit your onboarding questions", color: "bg-emerald-50 text-emerald-700" },
            ].map(({ href, icon: Icon, label, sub, color }) => (
              <Link key={href} href={href}>
                <Card hover>
                  <CardBody className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{label}</div>
                      <div className="text-xs text-slate-400">{sub}</div>
                    </div>
                    <ArrowRight size={15} className="ml-auto text-slate-300" />
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
