import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { AutomationSettings } from "@/components/dashboard/automation-settings";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  const agency = await prisma.agency.findUnique({
    where: { id: session!.user.agencyId },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your agency and onboarding preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <SettingsForm agencyId={agency?.id ?? ""} agencyName={agency?.name ?? ""} website={agency?.website ?? ""} />

        <AutomationSettings autoWelcomeEmail={agency?.autoWelcomeEmail ?? false} />

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Account</h2></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Name", value: session?.user.name },
                { label: "Email", value: session?.user.email },
                { label: "Role", value: "Agency Admin" },
                { label: "Plan", value: "Free" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</dt>
                  <dd className="text-slate-800 dark:text-slate-200 mt-0.5">{value}</dd>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">AI Configuration</h2></CardHeader>
          <CardBody>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Claude AI (Anthropic)</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Set your <code className="bg-slate-200 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">ANTHROPIC_API_KEY</code> in your <code className="bg-slate-200 dark:bg-slate-700 dark:text-slate-300 px-1 rounded">.env</code> file to enable AI analysis. The system uses claude-opus-4-6 for comprehensive client analysis.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Integrations</h2></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { name: "HubSpot CRM", desc: "Sync client data and pipeline stages" },
                { name: "Zapier", desc: "Trigger workflows when onboarding completes" },
                { name: "Google Drive", desc: "Auto-save client files to Drive folders" },
                { name: "Slack", desc: "Get notified when clients complete onboarding" },
              ].map(({ name, desc }) => (
                <div key={name} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">Coming soon</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
