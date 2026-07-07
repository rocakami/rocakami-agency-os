import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

const categories = ["Sales", "Client Onboarding", "Website Project", "CRM & GHL", "SEO", "Customer Support", "Finance & Admin", "HR & Contractor", "Automation", "Quality Assurance"];

export default function AdminSOPs() {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", purpose: "", category: "Sales", department: "", owner: "", status: "Draft", steps: "", tools_needed: "", related_templates: "" });
  const { toast } = useToast();

  const load = () => base44.entities.SOP.list("-updated_date").then(setSops).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: "", purpose: "", category: "Sales", department: "", owner: "", status: "Draft", steps: "", tools_needed: "", related_templates: "" }); setDialogOpen(true); };
  const openEdit = (sop) => { setEditing(sop); setForm({ title: sop.title, purpose: sop.purpose || "", category: sop.category, department: sop.department || "", owner: sop.owner || "", status: sop.status || "Draft", steps: sop.steps || "", tools_needed: sop.tools_needed || "", related_templates: sop.related_templates || "" }); setDialogOpen(true); };

  const save = async () => {
    if (!form.title) return;
    if (editing) { await base44.entities.SOP.update(editing.id, form); } else { await base44.entities.SOP.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "SOP updated" : "SOP created" });
  };

  const remove = async (id) => { await base44.entities.SOP.delete(id); load(); toast({ title: "SOP deleted" }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">SOPs ({sops.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add SOP</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {sops.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-sm">{s.title}</TableCell>
                <TableCell className="text-sm">{s.category}</TableCell>
                <TableCell className="text-sm">{s.owner || "—"}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(s.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit SOP" : "New SOP"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Draft", "Active", "Needs Review"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <Input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <Textarea placeholder="Step-by-step instructions (markdown)" rows={6} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
            <Input placeholder="Tools needed" value={form.tools_needed} onChange={(e) => setForm({ ...form, tools_needed: e.target.value })} />
            <Input placeholder="Related templates" value={form.related_templates} onChange={(e) => setForm({ ...form, related_templates: e.target.value })} />
            <Button onClick={save} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}