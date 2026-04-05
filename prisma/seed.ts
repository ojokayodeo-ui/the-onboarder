import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const agency = await prisma.agency.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: { name: "Demo Agency", slug: "demo-agency", website: "https://demoagency.com", primaryColor: "#6366f1" },
  });

  const hashedPassword = await bcrypt.hash("password123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demoagency.com" },
    update: {},
    create: { email: "admin@demoagency.com", name: "Alex Johnson", password: hashedPassword, role: "AGENCY_ADMIN", agencyId: agency.id },
  });

  await prisma.onboardingForm.upsert({
    where: { id: "default-form-001" },
    update: {},
    create: {
      id: "default-form-001",
      agencyId: agency.id,
      name: "Standard Onboarding Form",
      description: "Comprehensive onboarding questionnaire",
      sections: JSON.stringify([]),
      isDefault: true,
      isActive: true,
    },
  });

  const client1 = await prisma.client.upsert({
    where: { onboardingToken: "sample-token-001" },
    update: {},
    create: {
      agencyId: agency.id,
      name: "Sarah Chen",
      email: "sarah@techflow.io",
      company: "TechFlow Solutions",
      status: "ONBOARDING_COMPLETED",
      pipelineStage: "STRATEGY",
      onboardingToken: "sample-token-001",
      invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.client.upsert({
    where: { onboardingToken: "sample-token-002" },
    update: {},
    create: {
      agencyId: agency.id,
      name: "Marcus Williams",
      email: "marcus@growthco.com",
      company: "GrowthCo",
      status: "ONBOARDING_IN_PROGRESS",
      pipelineStage: "ONBOARDING",
      onboardingToken: "sample-token-002",
      invitedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.client.upsert({
    where: { onboardingToken: "sample-token-003" },
    update: {},
    create: {
      agencyId: agency.id,
      name: "Priya Patel",
      email: "priya@nexusretail.com",
      company: "Nexus Retail",
      status: "INVITED",
      pipelineStage: "NEW_CLIENT",
      onboardingToken: "sample-token-003",
      invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: { clientId_section: { clientId: client1.id, section: "business" } },
    update: {},
    create: {
      clientId: client1.id,
      section: "business",
      data: JSON.stringify({ companyName: "TechFlow Solutions", website: "https://techflow.io", industry: "SaaS/Technology", location: "San Francisco, CA", teamSize: "6–15", founded: "2021" }),
      isComplete: true,
      completedAt: new Date(),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: { clientId_section: { clientId: client1.id, section: "offer" } },
    update: {},
    create: {
      clientId: client1.id,
      section: "offer",
      data: JSON.stringify({ products: "B2B SaaS platform for automated project management", pricing: "$299/mo starter, $799/mo growth, $1,999/mo enterprise", valueProposition: "We help engineering teams ship 40% faster", usp: "AI-powered scheduling, integrates with Jira/GitHub/Linear, 5-minute setup", averageDealSize: "$800", salesCycle: "1–4 weeks" }),
      isComplete: true,
      completedAt: new Date(),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: { clientId_section: { clientId: client1.id, section: "audience" } },
    update: {},
    create: {
      clientId: client1.id,
      section: "audience",
      data: JSON.stringify({ icp: "VP of Engineering at B2B SaaS companies, 50–500 employees", painPoints: "Constant context switching, resource bottlenecks, missed deadlines", desires: "Ship faster, reduce fires, build better products" }),
      isComplete: true,
      completedAt: new Date(),
    },
  });

  await prisma.onboardingResponse.upsert({
    where: { clientId_section: { clientId: client1.id, section: "goals" } },
    update: {},
    create: {
      clientId: client1.id,
      section: "goals",
      data: JSON.stringify({ primaryGoal: "Generate more leads", revenueTarget: "$2M ARR in 18 months", timeline: "3–6 months", currentChallenges: "Our marketing isn't generating consistent qualified leads" }),
      isComplete: true,
      completedAt: new Date(),
    },
  });

  await prisma.aIAnalysis.upsert({
    where: { clientId: client1.id },
    update: {},
    create: {
      clientId: client1.id,
      snapshot: JSON.stringify({ summary: "TechFlow Solutions is a B2B SaaS company targeting engineering teams. Strong technical product with clear ROI positioning. Currently in growth stage with solid fundamentals.", keyInsights: ["Clear, quantifiable value prop (40% faster shipping) — powerful for ad messaging", "Mid-market pricing with enterprise tier creates a good upsell path", "5-minute setup reduces adoption friction significantly", "Strong integration story (Jira/GitHub/Linear) targets existing dev workflows"] }),
      icpProfile: JSON.stringify({ icp: { title: "VP of Engineering", companySize: "50–500 employees", industry: "SaaS/Tech", revenue: "$5M–$100M ARR", technographics: ["Jira", "GitHub", "Slack", "Linear"] }, personas: [{ name: "The Overwhelmed VP", title: "VP of Engineering", age: "35–45", goals: "Ship faster, reduce fires, get promoted", painPoints: ["Constant context switching", "Resource bottlenecks", "Missed deadlines"], triggers: "A failed sprint or missed product launch", objections: ["Another tool to manage", "Team adoption"], messagingAngle: "Lead with time saved and team morale — not features" }] }),
      offerBreakdown: JSON.stringify({ strength: 78, strengths: ["Quantifiable outcome (40% faster)", "Clear integration story", "Low setup friction (5 min)"], weaknesses: ["3-tier pricing may cause confusion", "Missing social proof in messaging"], suggestions: ["Lead with outcome-first messaging in ads", "Add ROI calculator to pricing page", "Create case study from existing customer"] }),
      readinessScore: 72,
      readinessMissing: JSON.stringify(["No competitor data provided", "Marketing channels not specified", "No past campaign data"]),
      actionPlan: JSON.stringify([{ priority: 1, action: "Develop 3 ad creatives using the '40% faster' angle", category: "Content", timeframe: "Week 1" }, { priority: 2, action: "Set up lead tracking to establish baseline metrics", category: "Analytics", timeframe: "Week 1" }, { priority: 3, action: "Build competitor battle cards", category: "Research", timeframe: "Week 2-3" }, { priority: 4, action: "Launch cold email targeting VP Engineering at 50-500 person SaaS companies", category: "Outreach", timeframe: "Week 2-3" }]),
      inconsistencies: JSON.stringify([]),
    },
  });

  console.log("✅ Seed complete! Login: admin@demoagency.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
