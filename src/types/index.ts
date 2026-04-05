import type { User, Agency, Client, OnboardingResponse, AIAnalysis, Asset, Note } from "@prisma/client";

// ─────────────────────────────────────────────
// SESSION EXTENSION
// ─────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      agencyId: string;
      agencyName: string;
      agencySlug: string;
    };
  }
}

// ─────────────────────────────────────────────
// COMPOSITE TYPES
// ─────────────────────────────────────────────

export type ClientWithRelations = Client & {
  responses: OnboardingResponse[];
  aiAnalysis: AIAnalysis | null;
  assets: Asset[];
  notes: (Note & { author: Pick<User, "id" | "name" | "email"> })[];
  agency?: Agency;
};

export type ClientSummary = Pick<
  Client,
  "id" | "name" | "email" | "company" | "status" | "pipelineStage" | "createdAt" | "invitedAt" | "completedAt"
> & {
  _count?: { responses: number };
  readinessScore?: number | null;
};

// ─────────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────────

export interface FormQuestion {
  id: string;
  type: "text" | "textarea" | "select" | "multiselect" | "url" | "email" | "number" | "file";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  conditionalOn?: { questionId: string; value: string };
  helpText?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: FormQuestion[];
}

// ─────────────────────────────────────────────
// ONBOARDING RESPONSE DATA
// ─────────────────────────────────────────────

export interface BusinessData {
  companyName?: string;
  website?: string;
  industry?: string;
  location?: string;
  teamSize?: string;
  founded?: string;
}

export interface OfferData {
  products?: string;
  pricing?: string;
  valueProposition?: string;
  usp?: string;
  averageDealSize?: string;
  salesCycle?: string;
}

export interface AudienceData {
  icp?: string;
  buyerPersona?: string;
  painPoints?: string;
  desires?: string;
  buyingTriggers?: string;
  objections?: string;
}

export interface CompetitionData {
  competitors?: string;
  alternatives?: string;
  positioning?: string;
  winRate?: string;
}

export interface MarketingData {
  channels?: string[];
  messaging?: string;
  pastCampaigns?: string;
  funnelStructure?: string;
  monthlyLeads?: string;
  closeRate?: string;
}

export interface GoalsData {
  revenueTarget?: string;
  leadTarget?: string;
  timeline?: string;
  primaryGoal?: string;
  budget?: string;
  currentChallenges?: string;
}

export interface AssetsData {
  driveLinks?: string;
  additionalNotes?: string;
}

// ─────────────────────────────────────────────
// AI ANALYSIS PARSED
// ─────────────────────────────────────────────

export interface ParsedSnapshot {
  summary: string;
  keyInsights: string[];
}

export interface ParsedICPProfile {
  icp: {
    title: string;
    companySize: string;
    industry: string;
    revenue: string;
    geography?: string;
    technographics?: string[];
    psychographics?: string[];
  };
  personas: Array<{
    name: string;
    title: string;
    age: string;
    goals: string;
    painPoints: string[];
    triggers: string;
    objections: string[];
    messagingAngle?: string;
  }>;
}

export interface ParsedOfferBreakdown {
  strength: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface ParsedCompetitorOverview {
  competitors: Array<{ name: string; notes: string }>;
  positioning: string;
  opportunities: string[];
}

export interface ParsedMarketingAnalysis {
  currentChannels: string[];
  messagingStrength: string;
  gaps: string[];
  recommendations: string[];
}

export interface ParsedActionPlan {
  priority: number;
  action: string;
  category: string;
  timeframe: string;
}

// ─────────────────────────────────────────────
// API RESPONSE
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalClients: number;
  newThisMonth: number;
  onboardingCompleted: number;
  onboardingInProgress: number;
  averageReadinessScore: number;
  recentClients: ClientSummary[];
}
