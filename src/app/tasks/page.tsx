"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Clock, Plus, Trash2, ChevronDown, Calendar, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type AssignedTo = "CLIENT" | "AGENCY";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: AssignedTo;
  status: TaskStatus;
  dueDate?: string;
  client: { id: string; name: string; company?: string };
}

interface Client {
  id: string;
  name: string;
  company?: string;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: "TODO", label: "To Do", icon: Circle, color: "text-slate-400" },
  { value: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "text-amber-500" },
  { value: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
];

function StatusIcon({ status }: { status: TaskStatus }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status)!;
  const Icon = opt.icon;
  return <Icon size={16} className={opt.color} />;
}

function DueBadge({ dueDate }: { dueDate?: string }) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const overdue = isPast(d) && !isToday(d);
  const today = isToday(d);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
      overdue ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
      today ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
    )}>
      <Calendar size={10} />
      {overdue ? "Overdue" : today ? "Today" : format(d, "MMM d")}
    </span>
  );
}

function TaskCard({ task, onStatusChange, onDelete }: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: "TODO",
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border transition-all",
      task.status === "DONE"
        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-60"
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-700"
    )}>
      <button
        onClick={() => onStatusChange(task.id, nextStatus[task.status])}
        className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
        title="Click to advance status"
      >
        <StatusIcon status={task.status} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-slate-900 dark:text-white", task.status === "DONE" && "line-through text-slate-400")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {task.client.name}{task.client.company ? ` · ${task.client.company}` : ""}
          </span>
          <DueBadge dueDate={task.dueDate} />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {STATUS_OPTIONS.find(s => s.value === task.status)?.label}
            <ChevronDown size={10} />
          </button>
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onStatusChange(task.id, opt.value); setShowStatusMenu(false); }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700",
                    task.status === opt.value && "font-medium text-brand-600 dark:text-brand-400"
                  )}
                >
                  <opt.icon size={12} className={opt.color} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function AddTaskForm({ clients, assignedTo, onAdd, onClose }: {
  clients: Client[];
  assignedTo: AssignedTo;
  onAdd: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, clientId, assignedTo, dueDate: dueDate || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task created");
      onAdd();
      onClose();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-700 rounded-xl p-4 space-y-3">
      <Input label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Send brand assets" required autoFocus />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Any additional details..." />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
            ))}
          </select>
        </div>
        <Input label="Due date (optional)" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" loading={loading}>Add Task</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<AssignedTo>("AGENCY");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, clientsRes] = await Promise.all([
        fetch(`/api/tasks?assignedTo=${activeTab}`),
        fetch("/api/clients"),
      ]);
      setTasks(await tasksRes.json());
      const clientData = await clientsRes.json();
      setClients(Array.isArray(clientData) ? clientData : (clientData.clients ?? []));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleStatusChange(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
  }

  const filtered = tasks.filter((t) => filterStatus === "ALL" || t.status === filterStatus);
  const counts = { TODO: tasks.filter(t => t.status === "TODO").length, IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS").length, DONE: tasks.filter(t => t.status === "DONE").length };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Track client and agency tasks</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus size={15} className="mr-1.5" /> Add Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 w-fit">
        {([["AGENCY", "My Tasks", Briefcase], ["CLIENT", "Client Tasks", User]] as const).map(([val, label, Icon]) => (
          <button
            key={val}
            onClick={() => { setActiveTab(val); setShowAdd(false); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === val
                ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(filterStatus === opt.value ? "ALL" : opt.value)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all",
              filterStatus === opt.value
                ? "border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <opt.icon size={14} className={opt.color} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{opt.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts[opt.value]}</p>
          </button>
        ))}
      </div>

      {/* Add task form */}
      {showAdd && clients.length > 0 && (
        <div className="mb-4">
          <AddTaskForm clients={clients} assignedTo={activeTab} onAdd={fetchTasks} onClose={() => setShowAdd(false)} />
        </div>
      )}
      {showAdd && clients.length === 0 && (
        <Card className="mb-4 p-4 text-sm text-slate-500 dark:text-slate-400">
          No clients yet. Add a client first before creating tasks.
        </Card>
      )}

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks here</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            {activeTab === "AGENCY" ? "Add your internal to-dos for clients" : "Add tasks for your clients to complete"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
