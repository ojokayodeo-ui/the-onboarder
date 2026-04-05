import Link from "next/link";
import { Zap, ArrowRight, CheckCircle2, Users, BarChart3, Brain, FileText, GitBranch } from "lucide-react";

const features = [
  { icon: Users, title: "Smart Onboarding Wizard", desc: "7-step guided flow that collects everything you need — business info, ICP, offer, competitors, and goals." },
  { icon: Brain, title: "AI-Powered Analysis", desc: "Claude AI processes every response to generate ICP profiles, offer breakdowns, readiness scores, and action plans." },
  { icon: BarChart3, title: "Readiness Scoring", desc: "Instantly score client readiness 0–100. See what's missing before campaigns start." },
  { icon: GitBranch, title: "CRM Pipeline", desc: "Track every client across New → Onboarding → Strategy → Execution with drag-and-drop simplicity." },
  { icon: FileText, title: "Export Everything", desc: "One-click export to JSON, PDF, or CRM-ready format. Push to HubSpot, Notion, or Zapier." },
  { icon: CheckCircle2, title: "Save & Continue", desc: "Clients can save progress and return. No lost data, no frustration." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Onboarding OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-brand-100 dark:border-brand-800">
          <Brain size={14} />
          AI-powered client onboarding
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
          Onboard clients like a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-violet-600">
            pro agency
          </span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Collect everything you need, analyze it with AI, and turn raw client input into actionable strategy — all in one seamless workflow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 dark:shadow-brand-900/30 text-base">
            Start for free <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-base">
            View demo
          </Link>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-brand-950 to-slate-900 rounded-2xl p-1 shadow-2xl shadow-brand-200/20 dark:shadow-none">
          <div className="bg-slate-900 rounded-xl p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-slate-500 text-xs">Client Onboarding OS — Dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[["12", "Total Clients", "text-white"], ["4", "Onboarding", "text-amber-400"], ["7", "Completed", "text-emerald-400"], ["76", "Avg. Score", "text-brand-400"]].map(([val, label, cls]) => (
                <div key={label} className="bg-slate-800 rounded-lg p-4">
                  <div className={`text-2xl font-bold ${cls}`}>{val}</div>
                  <div className="text-slate-400 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              {[
                { name: "TechFlow Solutions", score: 72, status: "Completed", color: "bg-emerald-500" },
                { name: "GrowthCo", score: 45, status: "In Progress", color: "bg-amber-500" },
                { name: "Nexus Retail", score: 0, status: "Invited", color: "bg-blue-500" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{c.name[0]}</div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{c.name}</div>
                    <div className="h-1.5 bg-slate-700 rounded-full mt-1.5 w-48">
                      <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">{c.status}</span>
                  <span className="text-white text-sm font-bold">{c.score || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything your agency needs</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">From first contact to full delivery — organized in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/40 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to transform your onboarding?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Join agencies that close faster and deliver better results.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 dark:shadow-brand-900/30">
          Get started free <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-brand-500" />
            <span>Client Onboarding OS</span>
          </div>
          <span>Built for agencies that ship results.</span>
        </div>
      </footer>
    </div>
  );
}
