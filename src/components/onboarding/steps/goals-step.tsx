"use client";

import { useState } from "react";
import { StepWrapper } from "../step-wrapper";
import { Input, Textarea, Select } from "@/components/ui/input";

interface Props {
  initial: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}

const TIMELINES = ["ASAP (< 1 month)", "1–3 months", "3–6 months", "6–12 months", "12+ months"];
const PRIMARY_GOALS = ["Generate more leads", "Improve lead quality", "Close more deals", "Increase revenue per client", "Enter a new market", "Build brand awareness", "Launch a new product/service"];
const BUDGETS = ["< $1,000/mo", "$1k–$5k/mo", "$5k–$15k/mo", "$15k–$50k/mo", "$50k+/mo", "Not sure yet"];

export function GoalsStep({ initial, onNext, onSave, saving }: Props) {
  const [form, setForm] = useState({
    revenueTarget: (initial.revenueTarget as string) ?? "",
    leadTarget: (initial.leadTarget as string) ?? "",
    timeline: (initial.timeline as string) ?? "",
    primaryGoal: (initial.primaryGoal as string) ?? "",
    budget: (initial.budget as string) ?? "",
    currentChallenges: (initial.currentChallenges as string) ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <StepWrapper
      title="What does success look like?"
      description="Define your goals clearly so we can build a strategy that hits your actual targets — not just vanity metrics."
      emoji="🚀"
      onNext={() => onNext(form)}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <Select
        label="Primary Goal"
        options={PRIMARY_GOALS}
        placeholder="What's your #1 priority right now?"
        value={form.primaryGoal}
        onChange={(e) => update("primaryGoal", e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Revenue Target" placeholder="e.g. $500k ARR in 12 months" value={form.revenueTarget} onChange={(e) => update("revenueTarget", e.target.value)} />
        <Input label="Lead / Client Target" placeholder="e.g. 50 new clients in 6 months" value={form.leadTarget} onChange={(e) => update("leadTarget", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Timeline Expectation" options={TIMELINES} placeholder="Select..." value={form.timeline} onChange={(e) => update("timeline", e.target.value)} />
        <Select label="Monthly Marketing Budget" options={BUDGETS} placeholder="Select..." value={form.budget} onChange={(e) => update("budget", e.target.value)} />
      </div>
      <Textarea
        label="Biggest Current Challenge"
        placeholder="What's the #1 thing holding you back from reaching your goals right now? Be honest — this helps us prioritize."
        value={form.currentChallenges}
        onChange={(e) => update("currentChallenges", e.target.value)}
        rows={4}
        required
      />
    </StepWrapper>
  );
}
