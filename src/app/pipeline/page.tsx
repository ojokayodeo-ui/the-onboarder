import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { statusColor, statusLabel, formatDateRelative, calculateOnboardingProgress, scoreColor } from "@/lib/utils";

const STAGES = [
  { key: "NEW_CLIENT", label: "New Client", border: "border-t-slate-400", bg: "bg-slate-50 dark:bg-slate-900/50" },
  { key: "ONBOARDING", label: "Onboarding", border: "border-t-amber-400", bg: "bg-amber-50/30 dark:bg-amber-900/10" },
  { key: "STRATEGY", label: "Strategy", border: "border-t-brand-500", bg: "bg-brand-50/30 dark:bg-brand-900/10" },
  { key: "EXECUTION", label: "Execution", border: "border-t-emerald-500", bg: "bg-emerald-50/30 dark:bg-emerald-900/10" },
] as const;

export default async function PipelinePage() {
  const session = await getServerSession(authOptions);

  const clients = await prisma.client.findMany({
    where: { agencyId: session!.user.agencyId },
    include: {
      responses: { select: { section: true, isComplete: true } },
      aiAnalysis: { select: { readinessScore: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStage = Object.fromEntries(
    STAGES.map(({ key }) => [key, clients.filter((c) => c.pipelineStage === key)])
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{clients.length} clients across all stages</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 items-start">
        {STAGES.map(({ key, label, border, bg }) => {
          const stageClients = byStage[key] ?? [];
          return (
            <div key={key} className={`rounded-xl ${bg} p-3 border border-slate-200 dark:border-slate-700/60 border-t-4 ${border}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{label}</h2>
                <span className="text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {stageClients.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {stageClients.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">No clients here</div>
                ) : (
                  stageClients.map((client) => {
                    const progress = calculateOnboardingProgress(client.responses);
                    const score = client.aiAnalysis?.readinessScore;
                    return (
                      <Link key={client.id} href={`/clients/${client.id}`}>
                        <Card hover>
                          <CardBody className="p-3">
                            <div className="flex items-start gap-2.5 mb-2">
                              <Avatar name={client.company ?? client.name} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">{client.company ?? client.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{client.name}</p>
                              </div>
                              {score != null && (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(score)}`}>{score}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Progress value={progress} size="sm" className="flex-1" />
                              <span className="text-xs text-slate-400 dark:text-slate-500 w-7">{progress}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColor(client.status)}`}>
                                {statusLabel(client.status)}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateRelative(client.createdAt)}</span>
                            </div>
                          </CardBody>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
