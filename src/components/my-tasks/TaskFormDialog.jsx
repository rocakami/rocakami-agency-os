import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function TaskFormDialog({ open, onOpenChange, editing, projects, contractors, currentUser, isPrivileged, onSaved }) {
  const [form, setForm] = useState({
    title: "", description: "", assigned_to: "", project_id: "", start_date: "", due_date: "", priority: "Medium", status: "To Do"
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        description: editing.description || "",
        assigned_to: editing.assigned_to || "",
        project_id: editing.project_id || "",
        start_date: editing.start_date || "",
        due_date: editing.due_date || "",
        priority: editing.priority || "Medium",
        status: editing.status || "To Do",
      });
    } else {
      setForm({
        title: "", description: "", assigned_to: "", project_id: "", start_date: "", due_date: "", priority: "Medium", status: "To Do"
      });
    }
  }, [editing, open]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const isPersonal = !form.project_id;
      const payload = {
        ...form,
        is_personal: isPersonal,
        created_by_user_id: currentUser?.id || "",
      };
      if (isPersonal) {
        payload.project_id = "";
      }
      if (form.status === "Done" && !editing?.completed_at) {
        payload.completed_at = new Date().toISOString();
      } else if (form.status !== "Done") {
        payload.completed_at = "";
      }

      if (editing) {
        await base44.entities.Task.update(editing.id, payload);
        toast({ title: "Task updated" });
      } else {
        await base44.entities.Task.create(payload);
        toast({ title: "Task created" });
      }
      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Error saving task", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Task Description *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" />
          </div>
          <div>
            <Label className="text-xs">Details</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details…" className="min-h-[60px]" />
          </div>
          <div>
            <Label className="text-xs">Project Delivery {isPrivileged ? "" : "(leave empty for personal task)"}</Label>
            <Select value={form.project_id || "__none"} onValueChange={(v) => setForm({ ...form, project_id: v === "__none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="— Personal Task (no project) —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— Personal Task (no project) —</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}{p.client_name ? ` (${p.client_name})` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Assigned To</Label>
              <Select value={form.assigned_to || "__none"} onValueChange={(v) => setForm({ ...form, assigned_to: v === "__none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— None —</SelectItem>
                  {contractors.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["To Do", "In Progress", "On Hold", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {editing ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}