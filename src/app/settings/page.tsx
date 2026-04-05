import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  const agency = await prisma.agency.findUnique({
    where: { id: session!.user.agencyId },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your agency and onboarding preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <SettingsForm
          agencyId={agency?.id ?? ""}
          agencyName={agency?.name ?? ""}
          website={agency?.website ?? ""}
        />

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900">Account</h2></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-400">Name</dt>
                <dd className="text-slate-800 mt-0.5">{session?.user.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Email</dt>
                <dd className="text-slate-800 mt-0.5">{session?.user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Role</dt>
                <dd className="text-slate-800 mt-0.5">Agency Admin</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Plan</dt>
                <dd className="text-slate-800 mt-0.5">Free</dd>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900">AI Configuration</h2></CardHeader>
          <CardBody>
            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-700 mb-1">Claude AI (Anthropic)</p>
              <p className="text-slate-500 text-xs">Set your <code className="bg-slate-200 px-1 rounded">ANTHROPIC_API_KEY</code> in your <code className="bg-slate-200 px-1 rounded">.env</code> file to enable AI analysis. The system uses claude-opus-4-6 for comprehensive client analysis.</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900">Integrations</h2></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { name: "HubSpot CRM", desc: "Sync client data and pipeline stages", status: "Coming soon" },
                { name: "Zapier", desc: "Trigger workflows when onboarding completes", status: "Coming soon" },
                { name: "Google Drive", desc: "Auto-save client files to Drive folders", status: "Coming soon" },
                { name: "Slack", desc: "Get notified when clients complete onboarding", status: "Coming soon" },
              ].map(({ name, desc, status }) => (
                <div key={name} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{status}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
