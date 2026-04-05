"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SyncResult {
  wonDeals: number;
  created: number;
  skipped: number;
  errors: string[];
}

export default function IntegrationsPage() {
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [dealCount, setDealCount] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  async function checkConnection() {
    setChecking(true);
    setConnectionError(null);
    try {
      const res = await fetch("/api/sync/salesflow");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDealCount(data.wonDeals);
      toast.success(`Connected — ${data.wonDeals} won client(s) found`);
    } catch (err) {
      setConnectionError(String(err));
      toast.error("Could not connect to Salesflow");
    } finally {
      setChecking(false);
    }
  }

  async function runSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync/salesflow", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      if (data.created > 0) {
        toast.success(`${data.created} new client(s) added and invited`);
      } else {
        toast.info("No new clients to sync");
      }
    } catch (err) {
      toast.error(String(err));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Integrations</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Connect your tools and automate client onboarding</p>
      </div>

      {/* Salesflow Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/40 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <CardTitle className="text-base">Pipeline Activation — Salesflow</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sync won clients → auto-invite to onboarding</p>
              </div>
            </div>
            <Badge variant={dealCount !== null ? "success" : "default"}>
              {dealCount !== null ? "Connected" : "Not checked"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* How it works */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">HOW IT WORKS</p>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 flex-wrap">
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">Won in Salesflow CRM</span>
              <ArrowRight size={14} className="text-slate-400" />
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">Added as client here</span>
              <ArrowRight size={14} className="text-slate-400" />
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">Invite email sent</span>
            </div>
          </div>

          {/* Connection status */}
          {connectionError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Connection failed</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{connectionError}</p>
                <p className="text-xs text-red-500 dark:text-red-600 mt-1">Make sure SALESFLOW_API_URL is set in Railway variables</p>
              </div>
            </div>
          )}

          {dealCount !== null && !connectionError && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Connected — <span className="font-semibold">{dealCount} won client(s)</span> ready to sync
              </p>
            </div>
          )}

          {/* Sync result */}
          {result && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Won in CRM", value: result.wonDeals, color: "text-brand-600 dark:text-brand-400" },
                { label: "Newly added", value: result.created, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Already existed", value: result.skipped, color: "text-slate-500 dark:text-slate-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {result?.errors && result.errors.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Some clients had errors:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-amber-600 dark:text-amber-500">{e}</p>)}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={checkConnection} loading={checking}>
              <CheckCircle2 size={14} className="mr-1.5" />
              Test Connection
            </Button>
            <Button size="sm" onClick={runSync} loading={syncing}>
              <RefreshCw size={14} className="mr-1.5" />
              Sync Won Clients
            </Button>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Sync is safe to run multiple times — existing clients are never duplicated. New clients receive an onboarding invite email automatically.
          </p>
        </CardContent>
      </Card>

      {/* Clients synced */}
      <div className="mt-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Users size={12} />
          Clients synced from Salesflow appear in your <a href="/clients" className="text-brand-500 hover:underline">Clients</a> list with the Onboarding stage.
        </p>
      </div>
    </div>
  );
}
