"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Brain, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface ClientActionsProps {
  clientId: string;
  status: string;
  pipelineStage: string;
  onboardingToken: string;
}

const STAGES = ["NEW_CLIENT", "ONBOARDING", "STRATEGY", "EXECUTION"] as const;
const STAGE_LABELS: Record<string, string> = {
  NEW_CLIENT: "New Client",
  ONBOARDING: "Onboarding",
  STRATEGY: "Strategy",
  EXECUTION: "Execution",
};

export function ClientActions({ clientId, status, pipelineStage, onboardingToken }: ClientActionsProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [linkModal, setLinkModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentStage, setCurrentStage] = useState(pipelineStage);

  async function runAIAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      toast.success("AI analysis complete!");
      router.refresh();
    } catch {
      toast.error("Analysis failed. Check your API key.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function getLink() {
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json();
    if (res.ok) setLinkModal(data.onboardingUrl);
    else toast.error("Failed to generate link");
  }

  async function updateStage(stage: string) {
    setCurrentStage(stage);
    await fetch(`/api/clients/${clientId}/pipeline`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    router.refresh();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Pipeline stage */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="w-2 h-2 bg-brand-500 rounded-full" />
            {STAGE_LABELS[currentStage]}
            <ChevronDown size={14} />
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 w-40 hidden group-hover:block">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => updateStage(stage)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${currentStage === stage ? "text-brand-600 font-medium" : "text-slate-700"}`}
              >
                {STAGE_LABELS[stage]}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={getLink}>
          Get Link
        </Button>

        <Button size="sm" onClick={runAIAnalysis} loading={analyzing}>
          <Brain size={14} />
          {analyzing ? "Analyzing..." : "Run AI"}
        </Button>
      </div>

      {/* Onboarding link modal */}
      <Modal open={!!linkModal} onClose={() => setLinkModal(null)} title="Onboarding Link">
        {linkModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Share this link with your client:</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <code className="flex-1 text-xs text-slate-700 truncate">{linkModal}</code>
              <button onClick={() => copyLink(linkModal)} className="flex-shrink-0 p-1.5 hover:bg-slate-200 rounded-md transition-colors">
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-slate-500" />}
              </button>
            </div>
            <Button className="w-full" onClick={() => copyLink(linkModal)}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
