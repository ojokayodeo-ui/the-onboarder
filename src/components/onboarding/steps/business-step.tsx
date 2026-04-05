"use client";

import { useState } from "react";
import { StepWrapper } from "../step-wrapper";
import { Input, Select } from "@/components/ui/input";

interface Props {
  initial: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}

const INDUSTRIES = ["SaaS/Technology", "E-commerce", "Marketing Agency", "Consulting", "Healthcare", "Finance", "Real Estate", "Education", "Professional Services", "Manufacturing", "Other"];
const TEAM_SIZES = ["1 (Solo)", "2–5", "6–15", "16–50", "51–200", "200+"];

export function BusinessStep({ initial, onNext, onSave, saving }: Props) {
  const [form, setForm] = useState({
    companyName: (initial.companyName as string) ?? "",
    website: (initial.website as string) ?? "",
    industry: (initial.industry as string) ?? "",
    location: (initial.location as string) ?? "",
    teamSize: (initial.teamSize as string) ?? "",
    founded: (initial.founded as string) ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <StepWrapper
      title="Tell us about your business"
      description="Let's start with the basics. This helps us understand your company's context and background."
      emoji="🏢"
      onNext={() => onNext(form)}
      onSave={() => onSave(form)}
      saving={saving}
    >
      <Input label="Company Name" placeholder="Acme Corp" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
      <Input label="Website" type="url" placeholder="https://yourcompany.com" value={form.website} onChange={(e) => update("website", e.target.value)} helpText="Include https://" />
      <Select label="Industry" options={INDUSTRIES} placeholder="Select your industry" value={form.industry} onChange={(e) => update("industry", e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Location / HQ" placeholder="New York, USA" value={form.location} onChange={(e) => update("location", e.target.value)} />
        <Select label="Team Size" options={TEAM_SIZES} placeholder="Select size" value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} />
      </div>
      <Input label="Year Founded" placeholder="2020" value={form.founded} onChange={(e) => update("founded", e.target.value)} helpText="Optional" />
    </StepWrapper>
  );
}
