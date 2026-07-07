import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, UserCheck, Pencil, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";

const EMPTY = {
  name: "", role: "", email: "", phone: "", rate: "", assigned_clients: "",
  contract_status: "Active", employment_status: "Full Time", performance_notes: "",
  start_date: "", employee_id: "", folder_url: "", supervisor: ""
};

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => base44.entities.Contractor.list("-created_date").then(setContractors).finally(() => setLoading(false));

  useEffect(() => {
    load();
    base44.auth.me().then((me) => setIsAdmin(me.role === "admin")).catch(() => {});
  }, []);

  const filtered = contractors.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "", role: c.role || "", email: c.email || "", phone: c.phone || "",
      rate: c.rate || "", assigned_clients: c.assigned_clients || "",
      contract_status: c.contract_status || "Active", employment_status: c.employment_status || "Full Time",
      performance_notes: c.performance_notes || "", start_date: c.start_date || "",
      employee_id: c.employee_id || "", folder_url: c.folder_url || "", supervisor: c.supervisor || ""
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.role) { toast({ title: "Name and role are required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Contractor.update(editing.id, form);
      } else {
        await base44.entities.Contractor.create(form);
      }
      setDialogOpen(false);
      load();
      toast({ title: editing ? "Contractor updated" : "Contractor added" });
    } catch (e) {
      toast({ title: "Error saving contractor", variant: "destructive" });
    }
    setSaving(false);
  };

  const remove = async (id) => {
    try {
      await base44.entities.Contractor.delete(id);
      load();
      toast({ title: "Contractor removed" });
    } catch (e) {
      toast({ title: "Error removing contractor", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Contractor Management" description="Track contractors, rates, assignments, and performance" />

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contractors…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setForm(EMPTY); setDialogOpen(true); }} size="sm" className="gap-1">
            <UserCheck className="w-4 h-4" /> Add Contractor
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No contractors found" description={isAdmin ? "Add a new contractor to get started." : "Contractors can be added from the Admin panel."} />
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Supervisor</TableHead>
                  <TableHead className="font-semibold">Rate</TableHead>
                  <TableHead className="font-semibold">Employment</TableHead>
                  <TableHead className="font-semibold">Contract</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Link to={`/contractors/${c.id}`}>
                        <div className="hover:text-sky-600 transition-colors cursor-pointer">
                          <p className="font-medium text-sm">{c.name}</p>
                          {c.email && <p className="text-[11px] text-muted-foreground">{c.email}</p>}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{c.role}</TableCell>
                    <TableCell className="text-sm">{c.supervisor || "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{c.rate || "—"}</TableCell>
                    <TableCell className="text-sm">{c.employment_status || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.contract_status} /></TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(c.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

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
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Input placeholder="Immediate Supervisor" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Rate (e.g. $50/hr)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
              <Input placeholder="Assigned clients" value={form.assigned_clients} onChange={(e) => setForm({ ...form, assigned_clients: e.target.value })} />
            </div>
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
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              <Input placeholder="Employee ID" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
            </div>
            <Input placeholder="Personal folder URL" value={form.folder_url} onChange={(e) => setForm({ ...form, folder_url: e.target.value })} />
            <Textarea placeholder="Performance notes" value={form.performance_notes} onChange={(e) => setForm({ ...form, performance_notes: e.target.value })} />
            <Button onClick={save} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing ? "Update Contractor" : "Add Contractor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}