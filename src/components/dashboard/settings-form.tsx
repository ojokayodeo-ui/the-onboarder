"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsFormProps {
  agencyId: string;
  agencyName: string;
  website: string;
}

export function SettingsForm({ agencyId, agencyName, website }: SettingsFormProps) {
  const [form, setForm] = useState({ name: agencyName, website });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Settings saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader><h2 className="font-semibold text-slate-900 dark:text-white">Agency Details</h2></CardHeader>
      <CardBody>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Agency Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Website" type="url" placeholder="https://youragency.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </CardBody>
    </Card>
  );
}
