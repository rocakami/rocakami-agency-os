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

export default function AdminContractors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", email: "", rate: "", assigned_clients: "", contract_status: "Active", employment_status: "Full Time", performance_notes: "", start_date: "", employee_id: "", folder_url: "" });
  const { toast } = useToast();

  const load = () => base44.entities.Contractor.list("-created_date").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", role: "", email: "", rate: "", assigned_clients: "", contract_status: "Active", employment_status: "Full Time", performance_notes: "", start_date: "", employee_id: "", folder_url: "" }); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, role: c.role, email: c.email || "", rate: c.rate || "", assigned_clients: c.assigned_clients || "", contract_status: c.contract_status || "Active", employment_status: c.employment_status || "Full Time", performance_notes: c.performance_notes || "", start_date: c.start_date || "", employee_id: c.employee_id || "", folder_url: c.folder_url || "" }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name || !form.role) return;
    if (editing) { await base44.entities.Contractor.update(editing.id, form); } else { await base44.entities.Contractor.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Contractor updated" : "Contractor added" });
  };

  const remove = async (id) => { await base44.entities.Contractor.delete(id); load(); toast({ title: "Contractor removed" }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Contractors ({items.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Contractor</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Rate</TableHead><TableHead>Employment</TableHead><TableHead>Contract</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-sm">{c.name}</TableCell>
                <TableCell className="text-sm">{c.role}</TableCell>
                <TableCell className="text-sm">{c.rate || "—"}</TableCell>
                <TableCell className="text-sm">{c.employment_status || "—"}</TableCell>
                <TableCell><StatusBadge status={c.contract_status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Contractor" : "New Contractor"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Role *" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Rate (e.g. $50/hr)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            </div>
            <Input placeholder="Assigned clients" value={form.assigned_clients} onChange={(e) => setForm({ ...form, assigned_clients: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.contract_status} onValueChange={(v) => setForm({ ...form, contract_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Active", "On Hold", "Completed", "Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.employment_status} onValueChange={(v) => setForm({ ...form, employment_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Full Time", "Part Time", "Project Based"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input type="date" placeholder="Start date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Employee ID (e.g. RK-001)" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
              <Input placeholder="Personal folder URL" value={form.folder_url} onChange={(e) => setForm({ ...form, folder_url: e.target.value })} />
            </div>
            <Textarea placeholder="Performance notes" value={form.performance_notes} onChange={(e) => setForm({ ...form, performance_notes: e.target.value })} />
            <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}