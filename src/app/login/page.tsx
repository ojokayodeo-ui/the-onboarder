"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Onboarding OS</span>
        </div>
        <div>
          <blockquote className="text-2xl font-medium text-white/90 leading-relaxed mb-6">
            &ldquo;We cut our onboarding time by 60% and our clients actually fill out the forms — because they&apos;re actually easy.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">MR</div>
            <div>
              <p className="text-white font-medium">Marcus Rivera</p>
              <p className="text-white/60 text-sm">Founder, Growth Agency</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[["500+", "Agencies"], ["12k+", "Clients onboarded"], ["4.9★", "Avg. rating"]].map(([val, label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-4">
              <div className="text-white font-bold text-xl">{val}</div>
              <div className="text-white/60 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">Onboarding OS</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your agency dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="mt-1 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPw ? "Hide" : "Show"} password
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-1">Demo credentials</p>
            <p className="text-xs text-slate-600">admin@demoagency.com / password123</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account yet?{" "}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
