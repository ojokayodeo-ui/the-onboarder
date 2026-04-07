// The 7-step client journey email sequence
export interface SequenceStep {
  id: string;
  step: number;
  label: string;
  trigger: string;       // When to send this
  purpose: string;       // What it achieves
  icon: string;
  color: string;
}

export const SEQUENCE_STEPS: SequenceStep[] = [
  {
    id: "welcome",
    step: 1,
    label: "Welcome Aboard",
    trigger: "When client is first added",
    purpose: "Warm welcome, introduce your agency, set the tone for the relationship",
    icon: "👋",
    color: "brand",
  },
  {
    id: "onboarding_invite",
    step: 2,
    label: "Onboarding Form Invite",
    trigger: "When you send the onboarding link",
    purpose: "Send their personalised onboarding link, explain the process and what to expect",
    icon: "📋",
    color: "violet",
  },
  {
    id: "reminder",
    step: 3,
    label: "Friendly Reminder",
    trigger: "2–3 days after invite if not completed",
    purpose: "Gentle nudge to complete the form — keep it light and helpful",
    icon: "🔔",
    color: "amber",
  },
  {
    id: "onboarding_complete",
    step: 4,
    label: "Onboarding Complete",
    trigger: "When client finishes the form",
    purpose: "Celebrate their completion, explain what happens next, set timeline expectations",
    icon: "🎉",
    color: "emerald",
  },
  {
    id: "strategy_ready",
    step: 5,
    label: "Your Strategy is Ready",
    trigger: "After AI analysis is completed",
    purpose: "Share key insights from their analysis, preview the action plan, book a strategy call",
    icon: "🧠",
    color: "brand",
  },
  {
    id: "week1_checkin",
    step: 6,
    label: "Week 1 Check-In",
    trigger: "7 days after onboarding completes",
    purpose: "Show early progress, confirm priorities, reinforce confidence in your agency",
    icon: "📈",
    color: "cyan",
  },
  {
    id: "growth_update",
    step: 7,
    label: "How We Grow Together",
    trigger: "2–3 weeks in",
    purpose: "Paint the bigger picture — your process, how you communicate, what success looks like",
    icon: "🚀",
    color: "violet",
  },
];

export function getSequenceStep(id: string): SequenceStep | undefined {
  return SEQUENCE_STEPS.find(s => s.id === id);
}
