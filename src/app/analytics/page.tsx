"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Users, TrendingUp, CheckCircle2, BarChart3, Mail, MessageSquare, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

interface AnalyticsData {
  summary: { totalClients: number; completionRate: number; avgScore: number | null; activeClients: number };
  pipelineData: { stage: string; count: number }[];
  scoreBuckets: { range: string; count: number }[];
  acquisitionData: { date: string; count: number }[];
  taskStats: { total: number; todo: number; inProgress: number; done: number; overdue: number };
  emailStats: { total: number; invites: number; reminders: number; welcome: number };
  messageData: { date: string; count: number }[];
  sectionData: { section: string; completion: number }[];
}

function StatCard({ label, value, icon: Icon, sub, color }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className={cn("text-3xl font-bold text-slate-900 dark:text-white", color)}>{value}</p>
            {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
          </div>
          <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
            <Icon size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1></div>
      <div className="grid grid-cols-4 gap-4 mb-6">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Understand your client behaviour and business performance</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={data.summary.totalClients} icon={Users} />
        <StatCard label="Completion Rate" value={`${data.summary.completionRate}%`} icon={CheckCircle2}
          sub="Onboarding completed" color={data.summary.completionRate >= 70 ? "text-emerald-600 dark:text-emerald-400" : undefined} />
        <StatCard label="Avg Readiness Score" value={data.summary.avgScore ?? "N/A"} icon={TrendingUp}
          sub="Across analysed clients" />
        <StatCard label="Active Clients" value={data.summary.activeClients} icon={BarChart3} />
      </div>

      {/* Client acquisition chart */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Client Acquisition — Last 30 Days</h2></CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.acquisitionData}>
              <defs>
                <linearGradient id="acqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                interval={Math.floor(data.acquisitionData.length / 6)} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#acqGrad)" strokeWidth={2} name="New clients" />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline distribution */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Pipeline Stage Distribution</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Clients" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Readiness score distribution */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Readiness Score Distribution</h2></CardHeader>
          <CardBody>
            {data.scoreBuckets.every(b => b.count === 0) ? (
              <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
                No AI analyses yet — run analysis on clients to see scores
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.scoreBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Clients">
                    {data.scoreBuckets.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        {/* Task stats */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Task Overview</h2></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "To Do", value: data.taskStats.todo, color: "text-slate-600 dark:text-slate-300" },
                { label: "In Progress", value: data.taskStats.inProgress, color: "text-amber-600 dark:text-amber-400" },
                { label: "Done", value: data.taskStats.done, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Overdue", value: data.taskStats.overdue, color: "text-red-600 dark:text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className={cn("text-2xl font-bold", color)}>{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {data.taskStats.overdue > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{data.taskStats.overdue} overdue task{data.taskStats.overdue > 1 ? "s" : ""} need attention</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Email & message activity */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Communications</h2></CardHeader>
          <CardBody>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                  <Mail size={15} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Emails sent</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{data.emailStats.total}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>{data.emailStats.invites} invites</span>
                    <span>·</span>
                    <span>{data.emailStats.reminders} reminders</span>
                    <span>·</span>
                    <span>{data.emailStats.welcome} welcome</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare size={15} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">Messages sent</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {data.messageData.reduce((a, b) => a + b.count, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={data.messageData.slice(-14)}>
                <defs>
                  <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#msgGrad)" strokeWidth={2} />
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Onboarding section completion */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Onboarding Section Completion</h2></CardHeader>
        <CardBody>
          <div className="grid grid-cols-7 gap-3">
            {data.sectionData.map(({ section, completion }) => (
              <div key={section} className="text-center">
                <div className="relative w-full aspect-square mb-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-slate-700" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#6366f1" strokeWidth="3"
                      strokeDasharray={`${(completion / 100) * 94.2} 94.2`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">{completion}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{section}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
