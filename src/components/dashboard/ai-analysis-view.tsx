"use client";

import { useState } from "react";
import { Brain, TrendingUp, Users, Target, Megaphone, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { parseJsonField, scoreColor } from "@/lib/utils";
import type { ParsedSnapshot, ParsedICPProfile, ParsedOfferBreakdown, ParsedCompetitorOverview, ParsedMarketingAnalysis } from "@/types";

interface Client {
  id: string;
  aiAnalysis: {
    snapshot: string | null;
    icpProfile: string | null;
    offerBreakdown: string | null;
    competitorOverview: string | null;
    marketingAnalysis: string | null;
    readinessScore: number | null;
    readinessMissing: string | null;
    actionPlan: string | null;
    inconsistencies: string | null;
  } | null;
}

export function AIAnalysisView({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    snapshot: true,
    icp: false,
    offer: false,
    competitors: false,
    marketing: false,
  });

  function toggle(section: string) {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const analysis = client.aiAnalysis;
  if (!analysis) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
            <Brain size={22} className="text-brand-500" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">No AI analysis yet</h3>
          <p className="text-sm text-slate-500 max-w-xs">Click &quot;Run AI&quot; above to generate the full analysis — ICP, offer breakdown, action plan, and readiness score.</p>
        </CardBody>
      </Card>
    );
  }

  const snapshot = parseJsonField(analysis.snapshot) as ParsedSnapshot | null;
  const icp = parseJsonField(analysis.icpProfile) as ParsedICPProfile | null;
  const offer = parseJsonField(analysis.offerBreakdown) as ParsedOfferBreakdown | null;
  const competitors = parseJsonField(analysis.competitorOverview) as ParsedCompetitorOverview | null;
  const marketing = parseJsonField(analysis.marketingAnalysis) as ParsedMarketingAnalysis | null;
  const missing = parseJsonField(analysis.readinessMissing) as string[] | null;
  const inconsistencies = parseJsonField(analysis.inconsistencies) as string[] | null;

  const sections = [
    { key: "snapshot", label: "Client Snapshot", icon: Brain, content: snapshot && (
      <div className="space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed">{snapshot.summary}</p>
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Insights</h4>
          <ul className="space-y-2">
            {snapshot.keyInsights?.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 bg-brand-50 text-brand-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )},
    { key: "icp", label: "ICP & Buyer Personas", icon: Users, content: icp && (
      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ideal Customer Profile</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(icp.icp ?? {}).map(([key, val]) => {
              if (!val || (Array.isArray(val) && val.length === 0)) return null;
              const value = Array.isArray(val) ? (val as string[]).join(", ") : String(val);
              return (
                <div key={key} className={Array.isArray(val) || value.length > 40 ? "col-span-2" : ""}>
                  <dt className="text-xs font-medium text-slate-400">{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd className="text-sm text-slate-800 mt-0.5">{value}</dd>
                </div>
              );
            })}
          </div>
        </div>
        {icp.personas?.map((persona, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-800 mb-3">"{persona.name}" — {persona.title}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-slate-400">Age</dt><dd className="text-slate-700 mt-0.5">{persona.age}</dd></div>
              <div><dt className="text-xs text-slate-400">Goal</dt><dd className="text-slate-700 mt-0.5">{persona.goals}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-slate-400">Pain Points</dt><dd className="text-slate-700 mt-0.5">{persona.painPoints?.join(" • ")}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-slate-400">Trigger</dt><dd className="text-slate-700 mt-0.5">{persona.triggers}</dd></div>
              {persona.messagingAngle && <div className="col-span-2"><dt className="text-xs text-slate-400">Best Messaging Angle</dt><dd className="text-slate-700 mt-0.5 font-medium text-brand-700">{persona.messagingAngle}</dd></div>}
            </div>
          </div>
        ))}
      </div>
    )},
    { key: "offer", label: "Offer Breakdown", icon: TrendingUp, content: offer && (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Offer Strength</span>
              <span className={`text-sm font-bold ${scoreColor(offer.strength ?? 0).split(" ")[0]}`}>{offer.strength}/100</span>
            </div>
            <Progress value={offer.strength ?? 0} color={offer.strength >= 70 ? "emerald" : offer.strength >= 50 ? "amber" : "red"} size="lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> Strengths</h4>
            <ul className="space-y-1.5">
              {offer.strengths?.map((s, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1"><XCircle size={12} /> Weaknesses</h4>
            <ul className="space-y-1.5">
              {offer.weaknesses?.map((w, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span>{w}</li>)}
            </ul>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Suggestions</h4>
          <ul className="space-y-2">
            {offer.suggestions?.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="text-brand-500 font-bold">{i + 1}.</span>{s}</li>)}
          </ul>
        </div>
      </div>
    )},
    { key: "competitors", label: "Competitor Overview", icon: Target, content: competitors && (
      <div className="space-y-4">
        {competitors.competitors?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Competitors</h4>
            <div className="space-y-2">
              {competitors.competitors.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-800 text-sm w-32 flex-shrink-0">{c.name}</span>
                  <span className="text-sm text-slate-600">{c.notes}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div><h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Positioning Assessment</h4><p className="text-sm text-slate-700">{competitors.positioning}</p></div>
        {competitors.opportunities?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Opportunities</h4>
            <ul className="space-y-1.5">{competitors.opportunities.map((o, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-emerald-500">→</span>{o}</li>)}</ul>
          </div>
        )}
      </div>
    )},
    { key: "marketing", label: "Marketing Analysis", icon: Megaphone, content: marketing && (
      <div className="space-y-4">
        {marketing.currentChannels?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Channels</h4>
            <div className="flex flex-wrap gap-2">{marketing.currentChannels.map((ch) => <span key={ch} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium">{ch}</span>)}</div>
          </div>
        )}
        <div><h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Messaging Strength</h4><p className="text-sm text-slate-700">{marketing.messagingStrength}</p></div>
        {marketing.gaps?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Gaps Identified</h4>
            <ul className="space-y-1.5">{marketing.gaps.map((g, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-amber-500">⚠</span>{g}</li>)}</ul>
          </div>
        )}
        {marketing.recommendations?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Recommendations</h4>
            <ul className="space-y-2">{marketing.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="text-brand-500 font-bold">{i + 1}.</span>{r}</li>)}</ul>
          </div>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Brain size={16} className="text-brand-600" />
        <h2 className="font-semibold text-slate-900">AI Analysis</h2>
        {analysis.readinessScore != null && (
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${scoreColor(analysis.readinessScore)}`}>
            Score: {analysis.readinessScore}/100
          </span>
        )}
      </div>

      {/* Missing items alert */}
      {missing && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Missing Information</span>
          </div>
          <ul className="space-y-1">
            {missing.map((item, i) => <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5"><span>•</span>{item}</li>)}
          </ul>
        </div>
      )}

      {sections.map(({ key, label, icon: Icon, content }) => {
        if (!content) return null;
        return (
          <Card key={key}>
            <button onClick={() => toggle(key)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors rounded-xl">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                <Icon size={15} className="text-brand-600" />
              </div>
              <span className="font-semibold text-slate-900 flex-1 text-left">{label}</span>
              {expanded[key] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {expanded[key] && <CardBody className="pt-0 border-t border-slate-100">{content}</CardBody>}
          </Card>
        );
      })}

      {/* Inconsistencies */}
      {inconsistencies && inconsistencies.length > 0 && inconsistencies[0] && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-red-600" />
            <span className="text-sm font-semibold text-red-800">Inconsistencies Detected</span>
          </div>
          <ul className="space-y-1">{inconsistencies.map((item, i) => <li key={i} className="text-xs text-red-700 flex items-start gap-1.5"><span>•</span>{item}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
