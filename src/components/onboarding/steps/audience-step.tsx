"use client";

import { useState } from "react";
import { StepWrapper } from "../step-wrapper";
import { Textarea } from "@/components/ui/input";

interface Props {
  initial: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}

export function AudienceStep({ initial, onNext, onSave, saving }: Props) {
  const [form, setForm] = useState({
    icp: (initial.icp as string) ?? "",
    buyerPersona: (initial.buyerPersona as string) ?? "",
    painPoints: (initial.painPoints as string) ?? "",
    desires: (initial.desires as string) ?? "",
    buyingTriggers: (initial.buyingTriggers as string) ?? "",
    objections: (initial.objections as string) ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <StepWrapper
      title="Who is your ideal customer?"
      description="The more specific you are here, the better we can build your targeting and messaging strategy."
      emoji="🎯"
      onNext={() => onNext(form)}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <Textarea
        label="Ideal Customer Profile (ICP)"
        placeholder="e.g. VP of Marketing at B2B SaaS companies, 50–500 employees, $5M–$50M ARR, based in the US, using HubSpot"
        value={form.icp}
        onChange={(e) => update("icp", e.target.value)}
        rows={3}
        required
        helpText="Be specific: job title, company size, industry, revenue, tech stack, geography."
      />
      <Textarea
        label="Buyer Persona Details"
        placeholder="Demographics, day-to-day challenges, how they get information, what they care about professionally..."
        value={form.buyerPersona}
        onChange={(e) => update("buyerPersona", e.target.value)}
        rows={3}
      />
      <Textarea
        label="Top Pain Points"
        placeholder="What problems keep them up at night? What frustrations do they have that your solution solves?"
        value={form.painPoints}
        onChange={(e) => update("painPoints", e.target.value)}
        rows={3}
        required
      />
      <Textarea
        label="Desires & Goals"
        placeholder="What outcomes are they hoping to achieve? What does success look like for them?"
        value={form.desires}
        onChange={(e) => update("desires", e.target.value)}
        rows={3}
      />
      <Textarea
        label="Buying Triggers"
        placeholder="What events or situations cause them to start looking for a solution? e.g. 'missed a quarterly target', 'new CMO joined', 'competitor launched'"
        value={form.buyingTriggers}
        onChange={(e) => update("buyingTriggers", e.target.value)}
        rows={2}
      />
      <Textarea
        label="Common Objections"
        placeholder="What reasons do prospects give for not buying? Price, timing, trust, existing solutions..."
        value={form.objections}
        onChange={(e) => update("objections", e.target.value)}
        rows={2}
      />
    </StepWrapper>
  );
}
