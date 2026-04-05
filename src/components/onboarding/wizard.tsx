"use client";

import { useState } from "react";
import { Zap, CheckCircle2, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BusinessStep } from "./steps/business-step";
import { OfferStep } from "./steps/offer-step";
import { AudienceStep } from "./steps/audience-step";
import { CompetitionStep } from "./steps/competition-step";
import { MarketingStep } from "./steps/marketing-step";
import { GoalsStep } from "./steps/goals-step";
import { AssetsStep } from "./steps/assets-step";
import { toast } from "sonner";

interface WizardProps {
  token: string;
  clientName: string;
  clientEmail: string;
  agencyName: string;
  savedResponses: Record<string, Record<string, unknown>>;
  completedSections: string[];
}

const STEPS = [
  { id: "business", label: "Business Info", emoji: "🏢" },
  { id: "offer", label: "Your Offer", emoji: "📦" },
  { id: "audience", label: "Target Audience", emoji: "🎯" },
  { id: "competition", label: "Competition", emoji: "⚔️" },
  { id: "marketing", label: "Marketing", emoji: "📣" },
  { id: "goals", label: "Goals", emoji: "🚀" },
  { id: "assets", label: "Assets", emoji: "📁" },
];

export function OnboardingWizard({ token, clientName, clientEmail, agencyName, savedResponses, completedSections }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    const firstIncomplete = STEPS.findIndex((s) => !completedSections.includes(s.id));
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [responses, setResponses] = useState<Record<string, Record<string, unknown>>>(savedResponses);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(completedSections));
  const [saving, setSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progress = (completed.size / totalSteps) * 100;

  async function saveSection(sectionId: string, data: Record<string, unknown>, markComplete = false) {
    setSaving(true);
    try {
      const res = await fetch(`/api/onboarding/${token}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionId, data, isComplete: markComplete }),
      });
      if (!res.ok) throw new Error("Save failed");
      const result = await res.json();
      setResponses((prev) => ({ ...prev, [sectionId]: data }));
      if (markComplete) setCompleted((prev) => { const next = new Set(Array.from(prev)); next.add(sectionId); return next; });
      if (result.completed) setIsComplete(true);
      return result;
    } catch {
      toast.error("Failed to save. Please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext(data: Record<string, unknown>) {
    const result = await saveSection(step.id, data, true);
    if (!result) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSaveDraft(data: Record<string, unknown>) {
    await saveSection(step.id, data, false);
    toast.success("Progress saved! You can continue anytime.");
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-brand-50 dark:from-emerald-950/30 dark:to-brand-950/30 dark:bg-slate-950 p-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20">
            <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">All done, {clientName.split(" ")[0]}! 🎉</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 leading-relaxed">
            Your onboarding is complete. The team at <strong>{agencyName}</strong> will review your responses and reach out soon.
          </p>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-left">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">What happens next:</h3>
            <div className="space-y-3">
              {["Our team reviews your onboarding data", "We run AI analysis to build your strategy", "You receive a personalized action plan", "We schedule a kickoff call"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepComponents = [
    <BusinessStep key="business" initial={responses.business ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} />,
    <OfferStep key="offer" initial={responses.offer ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} />,
    <AudienceStep key="audience" initial={responses.audience ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} />,
    <CompetitionStep key="competition" initial={responses.competition ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} />,
    <MarketingStep key="marketing" initial={responses.marketing ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} />,
    <GoalsStep key="goals" initial={responses.goals ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} />,
    <AssetsStep key="assets" initial={responses.assets ?? {}} onNext={handleNext} onSave={handleSaveDraft} saving={saving} isLast />,
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{agencyName}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} showLabel size="md" />
        </div>
      </header>

      {/* Step nav */}
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const isDone = completed.has(s.id);
            const isCurrent = i === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => (isDone || i <= currentStep) ? setCurrentStep(i) : null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isCurrent ? "bg-brand-600 text-white shadow-sm" :
                  isDone ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 cursor-pointer" :
                  "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-default"
                }`}
              >
                {isDone ? <CheckCircle2 size={12} /> : <span>{s.emoji}</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <main className="max-w-2xl mx-auto px-6 pb-16">
        <div className="animate-slide-up">
          {stepComponents[currentStep]}
        </div>
        {currentStep > 0 && (
          <div className="mt-4 flex justify-start">
            <button onClick={() => { setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <ChevronLeft size={16} />Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
