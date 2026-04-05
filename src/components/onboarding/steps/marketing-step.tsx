"use client";

import { useState } from "react";
import { StepWrapper } from "../step-wrapper";
import { Input, Textarea } from "@/components/ui/input";

interface Props {
  initial: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}

const CHANNELS = [
  "Paid Ads (Meta/Google)",
  "Cold Outbound (Email/LinkedIn)",
  "SEO / Content Marketing",
  "Referrals / Word of mouth",
  "Partnerships",
  "Events / Webinars",
  "Social Media (organic)",
  "Podcast / PR",
  "Community / Network",
  "Other",
];

export function MarketingStep({ initial, onNext, onSave, saving }: Props) {
  const [channels, setChannels] = useState<string[]>((initial.channels as string[]) ?? []);
  const [form, setForm] = useState({
    messaging: (initial.messaging as string) ?? "",
    pastCampaigns: (initial.pastCampaigns as string) ?? "",
    funnelStructure: (initial.funnelStructure as string) ?? "",
    monthlyLeads: (initial.monthlyLeads as string) ?? "",
    closeRate: (initial.closeRate as string) ?? "",
  });

  function toggleChannel(ch: string) {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    onNext({ ...form, channels });
  }

  function handleSave() {
    onSave({ ...form, channels });
  }

  return (
    <StepWrapper
      title="Your marketing & sales"
      description="Tell us how you currently get customers. Honesty here leads to better strategy."
      emoji="📣"
      onNext={handleNext}
      onSave={handleSave}
      saving={saving}
    >
      {/* Channel selection */}
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-3">Current Marketing Channels</label>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => toggleChannel(ch)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                channels.includes(ch)
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
        {channels.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">{channels.length} channel{channels.length > 1 ? "s" : ""} selected</p>
        )}
      </div>

      <Textarea
        label="Current Messaging & Angles Used"
        placeholder="What headlines, hooks, or angles do you currently use in your marketing? What's your main offer hook?"
        value={form.messaging}
        onChange={(e) => update("messaging", e.target.value)}
        rows={3}
      />
      <Textarea
        label="Past Campaigns (What Worked / Didn't)"
        placeholder="Any notable wins or failures? Campaigns that crushed it or flopped? What did you learn?"
        value={form.pastCampaigns}
        onChange={(e) => update("pastCampaigns", e.target.value)}
        rows={3}
      />
      <Textarea
        label="Funnel Structure"
        placeholder="e.g. Ad → Landing Page → VSL → Book a Call → Discovery Call → Proposal → Close"
        value={form.funnelStructure}
        onChange={(e) => update("funnelStructure", e.target.value)}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Current Monthly Leads" placeholder="~50 leads/month" value={form.monthlyLeads} onChange={(e) => update("monthlyLeads", e.target.value)} helpText="Approximate is fine" />
        <Input label="Current Close Rate" placeholder="~20%" value={form.closeRate} onChange={(e) => update("closeRate", e.target.value)} helpText="Approximate is fine" />
      </div>
    </StepWrapper>
  );
}
