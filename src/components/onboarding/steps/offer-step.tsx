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

const SALES_CYCLES = ["Same day", "1–7 days", "1–4 weeks", "1–3 months", "3+ months"];

export function OfferStep({ initial, onNext, onSave, saving }: Props) {
  const [form, setForm] = useState({
    products: (initial.products as string) ?? "",
    pricing: (initial.pricing as string) ?? "",
    valueProposition: (initial.valueProposition as string) ?? "",
    usp: (initial.usp as string) ?? "",
    averageDealSize: (initial.averageDealSize as string) ?? "",
    salesCycle: (initial.salesCycle as string) ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <StepWrapper
      title="What do you offer?"
      description="Describe your products or services, pricing, and what makes you different. Be as specific as possible."
      emoji="📦"
      onNext={() => onNext(form)}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <Textarea
        label="Products / Services"
        placeholder="Describe what you sell in detail. What does a client get when they work with you?"
        value={form.products}
        onChange={(e) => update("products", e.target.value)}
        rows={4}
        required
      />
      <Textarea
        label="Core Value Proposition"
        placeholder="What transformation or result do you deliver? e.g. 'We help SaaS companies reduce churn by 30% in 90 days'"
        value={form.valueProposition}
        onChange={(e) => update("valueProposition", e.target.value)}
        rows={3}
        required
        helpText="This is the most important field — be specific about the outcome you deliver."
      />
      <Textarea
        label="Pricing Structure"
        placeholder="e.g. $997/month retainer, $5,000 one-time setup fee, performance-based..."
        value={form.pricing}
        onChange={(e) => update("pricing", e.target.value)}
        rows={2}
      />
      <Textarea
        label="Unique Selling Points (USPs)"
        placeholder="What makes you different from every other option? List 3–5 specific differentiators."
        value={form.usp}
        onChange={(e) => update("usp", e.target.value)}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Average Deal / Order Value" placeholder="$5,000" value={form.averageDealSize} onChange={(e) => update("averageDealSize", e.target.value)} />
        <Select label="Typical Sales Cycle" options={SALES_CYCLES} placeholder="Select..." value={form.salesCycle} onChange={(e) => update("salesCycle", e.target.value)} />
      </div>
    </StepWrapper>
  );
}
