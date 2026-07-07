import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STATUS_STYLES = {
  "To Do": "bg-gray-100 text-gray-700 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "Done": "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_STYLES = {
  "Low": "text-gray-500",
  "Medium": "text-amber-600",
  "High": "text-red-600",
};

export default function ProjectTasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", assigned_to: "", due_date: "", priority: "Medium", status: "To Do" });
  const { toast } = useToast();

  const load = () => {
    base44.entities.Task.filter({ project_id: projectId }, "-created_date")
      .then(setTasks)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const addTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Task.create({ ...form, project_id: projectId });
      setForm({ title: "", assigned_to: "", due_date: "", priority: "Medium", status: "To Do" });
      setShowForm(false);
      load();
      toast({ title: "Task added" });
    } catch (e) {
      toast({ title: "Error adding task", variant: "destructive" });
    }
    setSaving(false);
  };

  const cycleStatus = async (task) => {
    const next = task.status === "To Do" ? "In Progress" : task.status === "In Progress" ? "Done" : "To Do";
    try {
      await base44.entities.Task.update(task.id, { status: next });
      load();
    } catch (e) {
      toast({ title: "Error updating task", variant: "destructive" });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await base44.entities.Task.delete(taskId);
      load();
    } catch (e) {
      toast({ title: "Error deleting task", variant: "destructive" });
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Tasks ({tasks.length})</h3>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm" className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Task
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-3 mb-3 space-y-2 bg-muted/30">
          <Input placeholder="Task title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Assigned to" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["To Do", "In Progress", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={addTask} disabled={saving || !form.title.trim()} size="sm" className="gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Save Task
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg bg-muted/40 p-6 text-center">
          <ListChecks className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No tasks yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add a task to track progress on this project.</p>
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 group hover:bg-muted/20 transition-colors">
              <button
                onClick={() => cycleStatus(t)}
                className={`text-[11px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLES[t.status] || STATUS_STYLES["To Do"]}`}
              >
                {t.status.toLowerCase()}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.assigned_to && <span>{t.assigned_to}</span>}
                  {t.assigned_to && t.due_date && <span> • </span>}
                  {t.due_date && <span>due {fmtDate(t.due_date)}</span>}
                  {t.assigned_to || t.due_date ? <span> • </span> : null}
                  <span className={PRIORITY_STYLES[t.priority] || ""}>{t.priority?.toLowerCase()}</span>
                </p>
              </div>
              <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}