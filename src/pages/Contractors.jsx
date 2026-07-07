import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, UserCheck, Pencil, Trash2, Loader2, ExternalLink, FolderPlus } from "lucide-react";
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
  contract_status: "Active", employment_status: "Full Time", employment_category: "Contractor", performance_notes: "",
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
  const [clients, setClients] = useState([]);
  const [generatingId, setGeneratingId] = useState(null);
  const { toast } = useToast();

  const load = () => base44.entities.Contractor.list("-created_date").then(setContractors).finally(() => setLoading(false));

  const parseClients = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(val).split(",").map((s) => s.trim()).filter(Boolean);
    }
  };

  const toggleClient = (clientName) => {
    const current = parseClients(form.assigned_clients);
    const next = current.includes(clientName)
      ? current.filter((n) => n !== clientName)
      : [...current, clientName];
    setForm({ ...form, assigned_clients: next.join(", ") });
  };

  useEffect(() => {
    load();
    base44.auth.me().then((me) => setIsAdmin(me.role === "admin")).catch(() => {});
    base44.entities.Client.list().then(setClients).catch(() => {});
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
      employment_category: c.employment_category || "Contractor",
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
        await base44.functions.invoke('manageContractor', { action: 'create', data: form });
      }
      setDialogOpen(false);
      load();
      toast({ title: editing ? "Contractor updated" : "Contractor added" });
    } catch (e) {
      toast({ title: "Error saving contractor", variant: "destructive" });
    }
    setSaving(false);
  };

  const generateFolder = async (contractor) => {
    if (!contractor.employee_id) {
      toast({ title: "Employee ID required before generating folder", variant: "destructive" });
      return;
    }
    setGeneratingId(contractor.id);
    try {
      const res = await base44.functions.invoke('generateContractorFolder', { contractor_id: contractor.id });
      setContractors((prev) => prev.map((c) => c.id === contractor.id ? { ...c, folder_url: res.data.folder_url } : c));
      toast({ title: "Folder created", description: `${contractor.employee_id} - ${contractor.name}` });
    } catch (e) {
      toast({ title: "Error creating folder", variant: "destructive" });
    }
    setGeneratingId(null);
  };

  const remove = async (c) => {
    try {
      await base44.functions.invoke('manageContractor', { action: 'delete', contractor_id: c.id });
      load();
      toast({ title: "Contractor removed", description: c.email ? "Access revoked and account deleted" : undefined });
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
                  <TableHead className="font-semibold">Employee ID</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Supervisor</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Employment</TableHead>
                  <TableHead className="font-semibold">Contract</TableHead>
                  <TableHead className="font-semibold">Folder</TableHead>
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
                    <TableCell className="text-sm font-mono">{c.employee_id || "—"}</TableCell>
                    <TableCell className="text-sm">{c.role}</TableCell>
                    <TableCell className="text-sm">{c.supervisor || "—"}</TableCell>
                    <TableCell className="text-sm">{c.employment_category || "—"}</TableCell>
                    <TableCell className="text-sm">{c.employment_status || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.contract_status} /></TableCell>
                    <TableCell className="text-sm">
                      {c.folder_url
                        ? <a href={c.folder_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sky-600 hover:underline inline-flex items-center gap-1">Here <ExternalLink className="w-3 h-3" /></a>
                        : (isAdmin
                          ? (generatingId === c.id
                            ? <span className="text-muted-foreground inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Creating…</span>
                            : <button onClick={() => generateFolder(c)} className="text-sky-600 hover:underline inline-flex items-center gap-1 font-medium"><FolderPlus className="w-3 h-3" /> Generate</button>)
                          : <span className="text-muted-foreground">—</span>)
                      }
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(c)}>
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
            <Select value={form.supervisor || "__none"} onValueChange={(v) => setForm({ ...form, supervisor: v === "__none" ? "" : v })}>
              <SelectTrigger>
                <SelectValue placeholder="Immediate Supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— None —</SelectItem>
                {contractors.filter((c) => c.employment_category === "Manager").map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Rate (e.g. $50/hr)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Assigned Clients</label>
              <Select value="__placeholder__" onValueChange={toggleClient}>
                <SelectTrigger>
                  <SelectValue placeholder={parseClients(form.assigned_clients).length > 0 ? `${parseClients(form.assigned_clients).length} selected` : "Select clients"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0
                    ? <SelectItem value="__none" disabled>No clients available</SelectItem>
                    : clients.map((cl) => {
                      const displayName = cl.company_name || cl.name;
                      return (
                        <SelectItem key={cl.id} value={displayName}>
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded border flex items-center justify-center ${parseClients(form.assigned_clients).includes(displayName) ? "bg-primary border-primary" : "border-input"}`}>
                              {parseClients(form.assigned_clients).includes(displayName) && <span className="text-white text-[8px]">✓</span>}
                            </span>
                            {displayName}
                          </span>
                        </SelectItem>
                      );
                    })
                  }
                </SelectContent>
              </Select>
              {parseClients(form.assigned_clients).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {parseClients(form.assigned_clients).map((name) => (
                    <span key={name} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5">
                      {name}
                      <button type="button" onClick={() => toggleClient(name)} className="text-muted-foreground hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              )}
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
              <Select value={form.employment_category} onValueChange={(v) => setForm({ ...form, employment_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Manager", "Contractor", "Employee"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              <Input placeholder="Employee ID" value={form.employee_id} readOnly disabled className="bg-muted cursor-not-allowed text-muted-foreground" />
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