import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const STAGES = ["Intake", "Discovery", "Proposal", "Onboarding", "Active", "Closure"];
const PRIORITIES = ["Low", "Medium", "High"];
const TYPES = ["Website", "SEO", "Branding", "Marketing", "CRM & GHL", "Automation", "Other"];
const BILLING = ["Not Billed", "Partially Billed", "Fully Billed", "Overdue"];

const EMPTY = {
  title: "", project_id: "", client_name: "", stage: "Intake", description: "",
  assigned_to: "", priority: "Medium", due_date: "", start_date: "",
  project_type: "Website", progress: 0,
  contract_value: "", budget: "", billing_status: "Not Billed", internal_notes: ""
};

export default function ProjectFormDialog({ open, onOpenChange, editing, clients, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({ ...EMPTY, ...editing, progress: editing.progress ?? 0 });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, editing]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const save = async () => {
    if (!form.title || !form.client_name) {
      toast({ title: "Title and client are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        progress: Number(form.progress) || 0,
        contract_value: form.contract_value ? Number(form.contract_value) : null,
        budget: form.budget ? Number(form.budget) : null,
      };
      if (editing) {
        await base44.entities.ClientProject.update(editing.id, payload);
        toast({ title: "Project updated" });
      } else {
        await base44.entities.ClientProject.create(payload);
        toast({ title: "Project created" });
      }
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">General</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Title *" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <Input placeholder="Project ID" value={form.project_id} onChange={(e) => set("project_id", e.target.value)} />
            </div>
            <Select value={form.client_name} onValueChange={(v) => set("client_name", v)}>
              <SelectTrigger><SelectValue placeholder="Client *" /></SelectTrigger>
              <SelectContent>
                {clients.length === 0
                  ? <SelectItem value="__none" disabled>No clients available</SelectItem>
                  : clients.map((c) => {
                    const name = c.company_name || c.name;
                    return <SelectItem key={c.id} value={name}>{name}</SelectItem>;
                  })
                }
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.project_type} onValueChange={(v) => set("project_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Assigned To" value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Start Date</label>
                <Input type="date" value={form.start_date || ""} onChange={(e) => set("start_date", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Due Date</label>
                <Input type="date" value={form.due_date || ""} onChange={(e) => set("due_date", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Progress: {form.progress}%</label>
              <Input type="range" min="0" max="100" value={form.progress} onChange={(e) => set("progress", e.target.value)} />
            </div>
            <Textarea placeholder="Description" value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="space-y-3 border-t pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Admin / Manager Only</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Contract Value ($)</label>
                <Input type="number" placeholder="0" value={form.contract_value || ""} onChange={(e) => set("contract_value", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Budget ($)</label>
                <Input type="number" placeholder="0" value={form.budget || ""} onChange={(e) => set("budget", e.target.value)} />
              </div>
            </div>
            <Select value={form.billing_status} onValueChange={(v) => set("billing_status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BILLING.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Internal notes (visible to managers only)" value={form.internal_notes || ""} onChange={(e) => set("internal_notes", e.target.value)} />
          </div>

          <Button onClick={save} disabled={saving} className="w-full gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? "Update Project" : "Add Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}