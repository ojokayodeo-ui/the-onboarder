"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { SEQUENCE_STEPS } from "@/lib/sequences";
import { cn } from "@/lib/utils";

interface SentLog {
  id: string;
  sequenceStep: string;
  subject: string;
  sentAt: string;
}

interface PreviewEmail {
  subject: string;
  body: string;
}

const COLOR_MAP: Record<string, string> = {
  brand: "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800",
  violet: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  cyan: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
};

export function ClientEmailSequence({ clientId }: { clientId: string }) {
  const [sentLogs, setSentLogs] = useState<SentLog[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewEmail | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/email/sequence?clientId=${clientId}`)
      .then(r => r.json())
      .then(data => setSentLogs(Array.isArray(data) ? data : []));
  }, [clientId]);

  function getSentLog(stepId: string) {
    return sentLogs.filter(l => l.sequenceStep === stepId);
  }

  async function sendSequenceEmail(stepId: string) {
    setSending(stepId);
    try {
      const res = await fetch("/api/email/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, stepId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSentLogs(prev => [...prev, { id: data.id ?? Date.now().toString(), sequenceStep: stepId, subject: data.subject, sentAt: new Date().toISOString() }]);
      toast.success("Email sent successfully");
      setPreview(null);
      setPreviewing(null);
    } catch (err) {
      toast.error("Failed to send: " + String(err));
    } finally {
      setSending(null);
    }
  }

  async function generatePreview(stepId: string) {
    if (previewing === stepId) { setPreviewing(null); setPreview(null); return; }
    setLoadingPreview(true);
    setPreviewing(stepId);
    try {
      const res = await fetch("/api/email/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, stepId, previewOnly: true }),
      });
      // For preview we use the same endpoint but don't actually send
      // We'll use a draft endpoint instead
      const draftRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: true, clientId, prompt: `Write the "${SEQUENCE_STEPS.find(s => s.id === stepId)?.label}" email. Purpose: ${SEQUENCE_STEPS.find(s => s.id === stepId)?.purpose}` }),
      });
      const data = await draftRes.json();
      setPreview({ subject: data.subject, body: data.body });
    } catch {
      toast.error("Failed to generate preview");
      setPreviewing(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  const sentCount = new Set(sentLogs.map(l => l.sequenceStep)).size;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Sequence progress</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{sentCount}/{SEQUENCE_STEPS.length} sent</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${(sentCount / SEQUENCE_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {SEQUENCE_STEPS.map((step) => {
        const logs = getSentLog(step.id);
        const sent = logs.length > 0;
        const isExpanded = expanded === step.id;

        return (
          <div key={step.id} className={cn(
            "rounded-xl border transition-all",
            sent
              ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          )}>
            <button
              className="w-full flex items-center gap-3 p-4 text-left"
              onClick={() => setExpanded(isExpanded ? null : step.id)}
            >
              {/* Step number / check */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all",
                sent
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                  : `${COLOR_MAP[step.color] ?? COLOR_MAP.brand} border`
              )}>
                {sent ? <CheckCircle2 size={16} /> : step.step}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-semibold",
                    sent ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"
                  )}>
                    {step.icon} {step.label}
                  </span>
                  {sent && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      Sent {logs.length > 1 ? `${logs.length}x` : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{step.trigger}</p>
              </div>

              {isExpanded ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{step.purpose}</p>

                {/* Sent history */}
                {logs.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={11} />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{log.subject}</span>
                        <span>·</span>
                        <span>{format(new Date(log.sentAt), "MMM d, h:mm a")}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview */}
                {previewing === step.id && preview && (
                  <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">SUBJECT</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">{preview.subject}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PREVIEW</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">{preview.body}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generatePreview(step.id)}
                    loading={loadingPreview && previewing === step.id}
                  >
                    <Sparkles size={12} className="mr-1" />
                    {previewing === step.id && preview ? "Hide preview" : "Preview"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendSequenceEmail(step.id)}
                    loading={sending === step.id}
                  >
                    <Send size={12} className="mr-1.5" />
                    {sent ? "Send again" : "Send now"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
