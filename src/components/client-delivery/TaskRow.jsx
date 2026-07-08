import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Check, X, Loader2 } from "lucide-react";

const STATUS_STYLES = {
  "To Do": "bg-gray-100 text-gray-700 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "On Hold": "bg-amber-100 text-amber-700 border-amber-200",
  "Done": "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_STYLES = {
  "Low": "text-gray-500",
  "Medium": "text-amber-600",
  "High": "text-red-600",
};

const STATUSES = ["To Do", "In Progress", "On Hold", "Done"];

export default function TaskRow({ task, contractors, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    assigned_to: task.assigned_to || "",
    start_date: task.start_date || "",
    due_date: task.due_date || "",
    priority: task.priority || "Medium",
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : null;

  const handleStatusChange = async (newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === "Done") {
        payload.completed_at = new Date().toISOString();
      } else {
        payload.completed_at = "";
      }
      await base44.entities.Task.update(task.id, payload);
      onUpdated();
    } catch (e) {
      // handled by parent reload
    }
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Task.update(task.id, editForm);
      setEditing(false);
      onUpdated();
    } catch (e) {
      // handled by parent reload
    }
    setSaving(false);
  };

  if (editing) {
    return (
      <div className="p-3 space-y-2 bg-muted/30">
        <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Select value={editForm.assigned_to || "__none"} onValueChange={(v) => setEditForm({ ...editForm, assigned_to: v === "__none" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Assigned to" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">— None —</SelectItem>
              {contractors.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} />
          <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" onClick={saveEdit} disabled={saving || !editForm.title.trim()} className="gap-1">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="gap-1">
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 group hover:bg-muted/20 transition-colors">
      <Select value={task.status} onValueChange={handleStatusChange}>
        <SelectTrigger className={`text-[11px] font-medium h-7 w-auto border rounded-full whitespace-nowrap px-2.5 ${STATUS_STYLES[task.status] || STATUS_STYLES["To Do"]}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-foreground ${task.status === "Done" ? "line-through text-muted-foreground/60" : ""}`}>{task.title}</p>
        <p className="text-xs text-muted-foreground">
          {task.assigned_to && <span>{task.assigned_to}</span>}
          {task.assigned_to && task.due_date && <span> • </span>}
          {task.due_date && <span>due {fmtDate(task.due_date)}</span>}
          {(task.assigned_to || task.due_date) && task.priority ? <span> • </span> : null}
          <span className={PRIORITY_STYLES[task.priority] || ""}>{task.priority?.toLowerCase()}</span>
          {task.status === "Done" && task.completed_at && (
            <span className="text-green-600"> • completed {fmtDateTime(task.completed_at)}</span>
          )}
        </p>
      </div>
      <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity shrink-0">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDeleted(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}