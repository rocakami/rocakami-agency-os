import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TaskRow from "./TaskRow";

export default function ProjectTasks({ projectId, onTasksChanged }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", assigned_to: "", start_date: "", due_date: "", priority: "Medium", status: "To Do" });
  const [contractors, setContractors] = useState([]);
  const { toast } = useToast();

  const load = () => {
    base44.entities.Task.filter({ project_id: projectId }, "-created_date")
      .then(setTasks)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    base44.entities.Contractor.list().then(setContractors).catch(() => {});
  }, [projectId]);

  const reload = () => {
    load();
    if (onTasksChanged) onTasksChanged();
  };

  const addTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Task.create({ ...form, project_id: projectId });
      setForm({ title: "", assigned_to: "", start_date: "", due_date: "", priority: "Medium", status: "To Do" });
      setShowForm(false);
      reload();
      toast({ title: "Task added" });
    } catch (e) {
      toast({ title: "Error adding task", variant: "destructive" });
    }
    setSaving(false);
  };

  const deleteTask = async (taskId) => {
    try {
      await base44.entities.Task.delete(taskId);
      reload();
      toast({ title: "Task deleted" });
    } catch (e) {
      toast({ title: "Error deleting task", variant: "destructive" });
    }
  };

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
            <Select value={form.assigned_to || "__none"} onValueChange={(v) => setForm({ ...form, assigned_to: v === "__none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Assigned to" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— None —</SelectItem>
                {contractors.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} placeholder="Start date" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} placeholder="Due date" />
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["To Do", "In Progress", "On Hold", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
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
            <TaskRow key={t.id} task={t} contractors={contractors} onUpdated={reload} onDeleted={deleteTask} />
          ))}
        </div>
      )}
    </div>
  );
}