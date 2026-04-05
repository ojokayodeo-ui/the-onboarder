"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Copy, Check, Mail, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { statusLabel, statusColor, formatDateRelative, calculateOnboardingProgress, scoreColor } from "@/lib/utils";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  pipelineStage: string;
  createdAt: string;
  completedAt: string | null;
  onboardingToken: string;
  responses: { section: string; isComplete: boolean }[];
  aiAnalysis: { readinessScore: number | null } | null;
}

const STAGE_LABELS: Record<string, string> = {
  NEW_CLIENT: "New Client", ONBOARDING: "Onboarding", STRATEGY: "Strategy", EXECUTION: "Execution",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState<{ client: Client; url: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/clients${params}`);
      const data = await res.json();
      setClients(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchClients, 300);
    return () => clearTimeout(timeout);
  }, [fetchClients]);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const { data } = await res.json();
      toast.success(`${form.name} added successfully`);
      setForm({ name: "", email: "", company: "" });
      setAddOpen(false);
      fetchClients();
      sendInvite(data.id, data);
    } catch {
      toast.error("Failed to add client");
    } finally {
      setSaving(false);
    }
  }

  async function sendInvite(clientId: string, client?: Client) {
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok) {
        const c = client ?? clients.find((c) => c.id === clientId);
        if (c) setInviteOpen({ client: c, url: data.onboardingUrl });
        fetchClients();
      }
    } catch {
      toast.error("Failed to generate invite link");
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast.success("Link copied to clipboard");
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus size={16} />Add Client</Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder="Search clients by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Client list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Plus size={24} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{search ? "No results found" : "No clients yet"}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{search ? "Try a different search term" : "Add your first client to start onboarding"}</p>
            {!search && <Button onClick={() => setAddOpen(true)}>Add first client</Button>}
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const progress = calculateOnboardingProgress(client.responses);
            const score = client.aiAnalysis?.readinessScore;
            return (
              <Card key={client.id} hover>
                <div className="flex items-center gap-4 px-5 py-4">
                  <Avatar name={client.company ?? client.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/clients/${client.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate">
                        {client.company ?? client.name}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(client.status)}`}>
                        {statusLabel(client.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{client.name}</span>
                      <span>•</span>
                      <span>{client.email}</span>
                      <span>•</span>
                      <span>{STAGE_LABELS[client.pipelineStage]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={progress} size="sm" className="w-32" />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{progress}% onboarded</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {score != null && (
                      <div className={`text-center px-3 py-1.5 rounded-xl ${scoreColor(score)}`}>
                        <div className="text-lg font-bold leading-none">{score}</div>
                        <div className="text-xs mt-0.5 opacity-75">score</div>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 dark:text-slate-500 text-right">
                      <div>{formatDateRelative(client.createdAt)}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => sendInvite(client.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title="Get onboarding link">
                        <ExternalLink size={15} />
                      </button>
                      <Link href={`/clients/${client.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Client">
        <form onSubmit={addClient} className="space-y-4">
          <Input label="Client name" placeholder="Sarah Chen" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="sarah@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Company" placeholder="TechFlow Solutions" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={saving}>Add & Get Link</Button>
          </div>
        </form>
      </Modal>

      {/* Invite Link Modal */}
      {inviteOpen && (
        <Modal open={!!inviteOpen} onClose={() => setInviteOpen(null)} title="Onboarding Link Ready">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Share this link with <strong>{inviteOpen.client.name}</strong>:</p>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <code className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{inviteOpen.url}</code>
              <button onClick={() => copyUrl(inviteOpen.url)} className="flex-shrink-0 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-slate-500 dark:text-slate-400" />}
              </button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => copyUrl(inviteOpen.url)}>
                <Copy size={14} />{copiedUrl ? "Copied!" : "Copy link"}
              </Button>
              <Button className="flex-1" onClick={() => window.open(`mailto:${inviteOpen.client.email}?subject=Your Onboarding Link&body=Hi ${inviteOpen.client.name},%0A%0AClick here to complete your onboarding:%0A%0A${inviteOpen.url}`)}>
                <Mail size={14} />Open email
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
