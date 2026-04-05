import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 60) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "New",
    INVITED: "Invited",
    ONBOARDING_STARTED: "Started",
    ONBOARDING_IN_PROGRESS: "In Progress",
    ONBOARDING_COMPLETED: "Completed",
    ACTIVE: "Active",
    PAUSED: "Paused",
    CHURNED: "Churned",
  };
  return labels[status] ?? status;
}

export function statusColor(status: string) {
  const colors: Record<string, string> = {
    NEW: "bg-slate-100 text-slate-700",
    INVITED: "bg-blue-50 text-blue-700",
    ONBOARDING_STARTED: "bg-amber-50 text-amber-700",
    ONBOARDING_IN_PROGRESS: "bg-orange-50 text-orange-700",
    ONBOARDING_COMPLETED: "bg-emerald-50 text-emerald-700",
    ACTIVE: "bg-green-50 text-green-700",
    PAUSED: "bg-yellow-50 text-yellow-700",
    CHURNED: "bg-red-50 text-red-700",
  };
  return colors[status] ?? "bg-slate-100 text-slate-700";
}

export function pipelineLabel(stage: string) {
  const labels: Record<string, string> = {
    NEW_CLIENT: "New Client",
    ONBOARDING: "Onboarding",
    STRATEGY: "Strategy",
    EXECUTION: "Execution",
  };
  return labels[stage] ?? stage;
}

export function parseJsonField(value: string | null | undefined): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function calculateOnboardingProgress(responses: { section: string; isComplete: boolean }[]) {
  const sections = ["business", "offer", "audience", "competition", "marketing", "goals", "assets"];
  const completedSections = responses.filter((r) => r.isComplete).map((r) => r.section);
  return Math.round((completedSections.length / sections.length) * 100);
}
