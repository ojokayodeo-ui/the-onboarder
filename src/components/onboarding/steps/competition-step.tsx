"use client";

import { useState } from "react";
import { StepWrapper } from "../step-wrapper";
import { Textarea, Select } from "@/components/ui/input";

interface Props {
  initial: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}

const WIN_RATES = ["Less than 20%", "20–40%", "40–60%", "60–80%", "80%+", "Not sure"];

export function CompetitionStep({ initial, onNext, onSave, saving }: Props) {
  const [form, setForm] = useState({
    competitors: (initial.competitors as string) ?? "",
    alternatives: (initial.alternatives as string) ?? "",
    positioning: (initial.positioning as string) ?? "",
    winRate: (initial.winRate as string) ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <StepWrapper
      title="Your competitive landscape"
      description="Understanding your competition helps us position you more effectively in the market."
      emoji="⚔️"
      onNext={() => onNext(form)}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <Textarea
        label="Known Competitors"
        placeholder="List the companies you compete with most often. Include their names and what they're known for."
        value={form.competitors}
        onChange={(e) => update("competitors", e.target.value)}
        rows={3}
        helpText="Even 'not sure' is useful — we'll research this for you."
      />
      <Textarea
        label="Alternatives Customers Consider"
        placeholder="What do prospects consider instead of you? e.g. doing it in-house, hiring a freelancer, using a different software, doing nothing..."
        value={form.alternatives}
        onChange={(e) => update("alternatives", e.target.value)}
        rows={3}
      />
      <Textarea
        label="Your Market Positioning"
        placeholder="How do you position yourself vs the competition? e.g. Premium & white-glove, niche specialist, best value, fastest results..."
        value={form.positioning}
        onChange={(e) => update("positioning", e.target.value)}
        rows={2}
      />
      <Select
        label="Typical Win Rate vs Competition"
        options={WIN_RATES}
        placeholder="Select..."
        value={form.winRate}
        onChange={(e) => update("winRate", e.target.value)}
      />
    </StepWrapper>
  );
}
