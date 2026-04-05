"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatDateRelative } from "@/lib/utils";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

export function ClientNotes({ clientId, initialNotes }: { clientId: string; initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes([{ ...data.data, createdAt: new Date().toISOString() }, ...notes]);
        setContent("");
      } else {
        toast.error("Failed to add note");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900 text-sm">Notes</h3>
          {notes.length > 0 && <span className="ml-auto text-xs text-slate-400">{notes.length}</span>}
        </div>
      </CardHeader>
      <CardBody className="p-4 space-y-4">
        <form onSubmit={addNote} className="flex gap-2">
          <input
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
            placeholder="Add a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={saving || !content.trim()} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
            <Send size={14} />
          </button>
        </form>

        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No notes yet</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start gap-2.5">
                <Avatar name={note.author.name ?? note.author.email} size="sm" />
                <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{note.author.name ?? note.author.email}</span>
                    <span className="text-xs text-slate-400">{formatDateRelative(note.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
