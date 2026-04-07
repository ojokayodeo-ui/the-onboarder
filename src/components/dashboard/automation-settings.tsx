"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Mail } from "lucide-react";

interface AutomationSettingsProps {
  autoWelcomeEmail: boolean;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        checked ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function AutomationSettings({ autoWelcomeEmail: initial }: AutomationSettingsProps) {
  const [autoWelcome, setAutoWelcome] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle(value: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoWelcomeEmail: value }),
      });
      if (!res.ok) throw new Error("Save failed");
      setAutoWelcome(value);
      toast.success(value ? "Auto welcome email enabled" : "Auto welcome email disabled");
    } catch {
      toast.error("Failed to save setting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-brand-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Email Automation</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Control which emails are sent automatically. You can always send any email manually from the client&apos;s Email Sequence tab.
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Auto welcome email */}
          <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-brand-50 dark:bg-brand-900/30 rounded-lg">
                <Mail size={14} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Auto-send &ldquo;Onboarding Complete&rdquo; email
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  When a client finishes all 7 sections of the onboarding form, automatically send them the
                  Step 4 &ldquo;Onboarding Complete&rdquo; confirmation email.
                </p>
                <div className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                  autoWelcome
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${autoWelcome ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {autoWelcome ? "Active" : "Manual only"}
                </div>
              </div>
            </div>
            <Toggle checked={autoWelcome} onChange={toggle} disabled={saving} />
          </div>

          {/* Placeholder for future automations */}
          {[
            {
              label: "Auto-send Welcome email when client is added",
              desc: "Send Step 1 automatically when you create a new client.",
            },
            {
              label: "Auto-send Onboarding Invite with link",
              desc: "Send Step 2 (with the form link) as soon as the client is created.",
            },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0 opacity-50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Mail size={14} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Coming soon</span>
                </div>
              </div>
              <Toggle checked={false} onChange={() => {}} disabled />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
