"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", agencyName: "" });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      toast.success("Account created! Signing you in...");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Onboarding OS</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Everything in one system</h2>
          <div className="space-y-4">
            {[
              "Guided 7-step client onboarding wizard",
              "AI-generated ICP profiles & buyer personas",
              "Readiness score with action plan",
              "CRM pipeline: New → Onboarding → Strategy → Execution",
              "Export to PDF, JSON, or CRM",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/40 text-sm">Free forever for small agencies. No credit card required.</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Onboarding OS</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5">Create your agency account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Set up in 30 seconds. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Your name" placeholder="Alex Johnson" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            <Input label="Agency name" placeholder="Acme Marketing Agency" value={form.agencyName} onChange={(e) => update("agencyName", e.target.value)} required />
            <Input label="Work email" type="email" placeholder="you@agency.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Create free account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
