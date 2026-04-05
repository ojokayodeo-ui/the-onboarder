import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { Zap, CheckCircle2 } from "lucide-react";

export default async function OnboardingPage({ params }: { params: { token: string } }) {
  const client = await prisma.client.findUnique({
    where: { onboardingToken: params.token },
    include: {
      responses: true,
      agency: { select: { name: true, logo: true, primaryColor: true } },
    },
  });

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid link</h1>
          <p className="text-slate-500">This onboarding link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (client.status === "ONBOARDING_COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">You&apos;re all set! 🎉</h1>
          <p className="text-slate-600 mb-2">
            Your onboarding is complete, <strong>{client.name}</strong>.
          </p>
          <p className="text-slate-500 text-sm">
            The team at <strong>{client.agency?.name}</strong> has everything they need to get started.
            Expect to hear from them soon!
          </p>
        </div>
      </div>
    );
  }

  // Build saved responses map
  const savedResponses: Record<string, Record<string, unknown>> = {};
  for (const r of client.responses) {
    try {
      savedResponses[r.section] = JSON.parse(r.data) as Record<string, unknown>;
    } catch { /* skip */ }
  }

  const completedSections = client.responses.filter((r) => r.isComplete).map((r) => r.section);

  return (
    <OnboardingWizard
      token={params.token}
      clientName={client.name}
      clientEmail={client.email}
      agencyName={client.agency?.name ?? "Your Agency"}
      savedResponses={savedResponses}
      completedSections={completedSections}
    />
  );
}
