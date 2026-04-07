"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  direction: string;
  subject: string;
  body: string;
  aiAssisted: boolean;
  sentAt: string;
}

export function ClientMessages({ clientId }: { clientId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [prompt, setPrompt] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [aiAssisted, setAiAssisted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages?clientId=${clientId}`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []));
  }, [clientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function generateDraft() {
    if (!prompt.trim()) return;
    setDrafting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: true, clientId, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubject(data.subject);
      setBody(data.body);
      setAiAssisted(true);
      setShowAiPrompt(false);
      setShowCompose(true);
      toast.success("Draft generated");
    } catch {
      toast.error("Failed to generate draft");
    } finally {
      setDrafting(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, subject, body, aiAssisted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, data]);
      setSubject(""); setBody(""); setAiAssisted(false); setShowCompose(false);
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Message history */}
      {messages.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
          No messages yet. Send your first message below.
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "rounded-xl p-4 border text-sm",
              msg.direction === "OUTBOUND"
                ? "bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800 ml-4"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mr-4"
            )}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white text-xs">{msg.subject}</span>
                  {msg.aiAssisted && (
                    <span className="inline-flex items-center gap-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded-full">
                      <Sparkles size={9} /> AI
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(msg.sentAt), "MMM d, h:mm a")}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* AI Draft */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
        <button
          onClick={() => setShowAiPrompt(!showAiPrompt)}
          className="flex items-center gap-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 mb-2"
        >
          <Sparkles size={13} /> Write with AI
          {showAiPrompt ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showAiPrompt && (
          <div className="flex gap-2 mb-3">
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder='e.g. "Follow up on their onboarding progress" or "Send a welcome message"'
              className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              onKeyDown={e => e.key === "Enter" && generateDraft()}
            />
            <Button size="sm" onClick={generateDraft} loading={drafting} variant="outline">
              <Sparkles size={13} className="mr-1" /> Draft
            </Button>
          </div>
        )}

        {/* Compose */}
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="w-full text-left text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-2 py-1"
        >
          <Send size={13} /> {showCompose ? "Hide" : "Compose message"}
          {showCompose ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
        </button>

        {showCompose && (
          <form onSubmit={sendMessage} className="mt-2 space-y-2">
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              required
              className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message..."
              required
              rows={4}
              className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 resize-none"
            />
            <div className="flex items-center justify-between">
              {aiAssisted && <span className="text-xs text-violet-500 flex items-center gap-1"><Sparkles size={11} /> AI-assisted draft</span>}
              <Button type="submit" size="sm" loading={sending} className="ml-auto">
                <Send size={13} className="mr-1.5" /> Send
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
