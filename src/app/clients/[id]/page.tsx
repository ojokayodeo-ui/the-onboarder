import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ClientActions } from "@/components/dashboard/client-actions";
import { AIAnalysisView } from "@/components/dashboard/ai-analysis-view";
import { ClientNotes } from "@/components/dashboard/client-notes";
import { statusLabel, statusColor, formatDate, formatDateRelative, calculateOnboardingProgress, scoreColor, scoreLabel, parseJsonField } from "@/lib/utils";
import type { ParsedSnapshot, ParsedActionPlan } from "@/types";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const client = await prisma.client.findFirst({
    where: { id: params.id, agencyId: session!.user.agencyId },
    include: {
      responses: true,
      aiAnalysis: true,
      assets: true,
      notes: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const progress = calculateOnboardingProgress(client.responses);
  const snapshot = parseJsonField(client.aiAnalysis?.snapshot) as ParsedSnapshot | null;
  const actionPlan = parseJsonField(client.aiAnalysis?.actionPlan) as ParsedActionPlan[] | null;

  const responseMap: Record<string, Record<string, unknown>> = {};
  for (const r of client.responses) {
    try { responseMap[r.section] = JSON.parse(r.data) as Record<string, unknown>; } catch { /* skip */ }
  }

  const sections = [
    { id: "business", label: "Business Info" },
    { id: "offer", label: "Offer Details" },
    { id: "audience", label: "Target Audience" },
    { id: "competition", label: "Competition" },
    { id: "marketing", label: "Marketing & Sales" },
    { id: "goals", label: "Goals" },
    { id: "assets", label: "Assets" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start gap-4 mb-8">
        <Link href="/clients" className="mt-1 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Avatar name={client.company ?? client.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{client.company ?? client.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(client.status)}`}>
                  {statusLabel(client.status)}
                </span>
                {client.email && <span className="text-sm text-slate-500 dark:text-slate-400">{client.email}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export/${client.id}?format=json`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={14} />Export
          </a>
          <ClientActions clientId={client.id} status={client.status} pipelineStage={client.pipelineStage} onboardingToken={client.onboardingToken} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-white">Onboarding Progress</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <Progress value={progress} showLabel size="lg" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {client.completedAt ? `Completed ${formatDate(client.completedAt)}` : client.invitedAt ? `Invited ${formatDateRelative(client.invitedAt)}` : `Created ${formatDate(client.createdAt)}`}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {sections.map(({ id, label }) => {
                  const response = client.responses.find((r) => r.section === id);
                  const isComplete = response?.isComplete ?? false;
                  const hasData = !!response;
                  return (
                    <div key={id} className="text-center">
                      <div className={`h-1.5 rounded-full mb-2 ${isComplete ? "bg-emerald-500" : hasData ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{label.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <AIAnalysisView client={client} />

          {/* Raw responses */}
          {Object.keys(responseMap).length > 0 && (
            <Card>
              <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Onboarding Responses</h2></CardHeader>
              <CardBody className="space-y-6">
                {sections.map(({ id, label }) => {
                  const data = responseMap[id];
                  if (!data || Object.keys(data).length === 0) return null;
                  return (
                    <div key={id}>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700/60">{label}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(data).map(([key, val]) => {
                          if (!val) return null;
                          const value = Array.isArray(val) ? (val as string[]).join(", ") : String(val);
                          const fieldLabel = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                          return (
                            <div key={key} className={Array.isArray(val) || value.length > 60 ? "col-span-2" : ""}>
                              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{fieldLabel}</dt>
                              <dd className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{value}</dd>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          )}

          {/* Assets */}
          {client.assets.length > 0 && (
            <Card>
              <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Assets & Files</h2></CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {client.assets.map((asset) => (
                    <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors">
                      <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                        <ExternalLink size={14} className="text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{asset.name}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{asset.type}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Score */}
          {client.aiAnalysis?.readinessScore != null && (
            <Card>
              <CardBody className="text-center py-6">
                <div className={`text-5xl font-extrabold mb-2 ${scoreColor(client.aiAnalysis.readinessScore).split(" ")[0]}`}>
                  {client.aiAnalysis.readinessScore}
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Readiness Score</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${scoreColor(client.aiAnalysis.readinessScore)}`}>
                  {scoreLabel(client.aiAnalysis.readinessScore)}
                </span>
              </CardBody>
            </Card>
          )}

          {/* Client info */}
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Client Info</h3></CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: "Contact", value: client.name },
                { label: "Email", value: client.email },
                { label: "Company", value: client.company },
                { label: "Pipeline", value: client.pipelineStage.replace(/_/g, " ") },
                { label: "Added", value: formatDate(client.createdAt) },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</dt>
                  <dd className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{value}</dd>
                </div>
              ) : null)}
            </CardBody>
          </Card>

          {/* Action plan */}
          {actionPlan && actionPlan.length > 0 && (
            <Card>
              <CardHeader><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Action Plan</h3></CardHeader>
              <CardBody className="space-y-3">
                {actionPlan.slice(0, 5).map((item) => (
                  <div key={item.priority} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 rounded-full text-xs font-bold flex items-center justify-center mt-0.5">{item.priority}</span>
                    <div>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{item.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{item.category}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{item.timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <ClientNotes clientId={client.id} initialNotes={client.notes.map(n => ({ ...n, createdAt: n.createdAt.toISOString() }))} />
        </div>
      </div>
    </div>
  );
}
