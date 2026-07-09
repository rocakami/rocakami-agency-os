import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const PRIORITIES = ["Low", "Medium", "High"];

const EMPTY = {
  title: "", project_id: "", client_name: "", stage: "Intake", description: "",
  assigned_to: "", priority: "Medium", due_date: "", start_date: "",
  project_type: "Website", progress: 0,
  contract_value: "", budget: "", billing_status: "Not Billed", internal_notes: ""
};

export default function ProjectFormDialog({ open, onOpenChange, editing, clients, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [stages, setStages] = useState([]);
  const [billingStatuses, setBillingStatuses] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({ ...EMPTY, ...editing, progress: editing.progress ?? 0 });
      } else {
        setForm(EMPTY);
        base44.functions.invoke("generateProjectId", {}).then((res) => {
          if (res.data?.project_id) set("project_id", res.data.project_id);
        }).catch(() => {});
      }
      base44.entities.Contractor.list().then(setContractors).catch(() => {});
      base44.entities.DropdownOption.filter({ dropdown_name: "Pipeline Status" }, "order").then(setStages).catch(() => {});
      base44.entities.DropdownOption.filter({ dropdown_name: "Billing Status" }, "order").then(setBillingStatuses).catch(() => {});
      base44.entities.DropdownOption.filter({ dropdown_name: "Project Category" }, "order").then(setProjectCategories).catch(() => {});
    }
  }, [open, editing]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const parseAssigned = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(val).split(",").map((s) => s.trim()).filter(Boolean);
    }
  };

  const toggleContractor = (name) => {
    const current = parseAssigned(form.assigned_to);
    const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
    set("assigned_to", next.join(", "));
  };

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
              <Input placeholder="Project ID" value={form.project_id} onChange={(e) => set("project_id", e.target.value)} readOnly={!editing} className={!editing ? "bg-muted/50 text-muted-foreground font-mono" : ""} />
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
                <SelectContent>{stages.map((s) => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.project_type} onValueChange={(v) => set("project_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{projectCategories.map((t) => <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <div className="space-y-1">
                <Select value="__placeholder__" onValueChange={toggleContractor}>
                  <SelectTrigger>
                    <SelectValue placeholder={parseAssigned(form.assigned_to).length > 0 ? `${parseAssigned(form.assigned_to).length} assigned` : "Assign contractors"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors.length === 0
                      ? <SelectItem value="__none" disabled>No contractors available</SelectItem>
                      : contractors.map((c) => {
                        const name = c.name;
                        const selected = parseAssigned(form.assigned_to).includes(name);
                        return (
                          <SelectItem key={c.id} value={name}>
                            <span className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded border flex items-center justify-center ${selected ? "bg-primary border-primary" : "border-input"}`}>
                                {selected && <span className="text-white text-[8px]">✓</span>}
                              </span>
                              {name}
                            </span>
                          </SelectItem>
                        );
                      })
                    }
                  </SelectContent>
                </Select>
                {parseAssigned(form.assigned_to).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {parseAssigned(form.assigned_to).map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5">
                        {name}
                        <button type="button" onClick={() => toggleContractor(name)} className="text-muted-foreground hover:text-destructive">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
              <SelectContent>{billingStatuses.map((b) => <SelectItem key={b.id} value={b.label}>{b.label}</SelectItem>)}</SelectContent>
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