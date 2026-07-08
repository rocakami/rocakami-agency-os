import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

export default function AdminContractors() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [permMap, setPermMap] = useState({});
  const [accessLoading, setAccessLoading] = useState(null);
  const [onboardingSections, setOnboardingSections] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", email: "", rate: "", assigned_clients: "", contract_status: "Active", employment_status: "Full Time", performance_notes: "", start_date: "", employee_id: "", folder_url: "" });
  const { toast } = useToast();

  const load = async () => {
    try {
      const [contractorList, userList, permList, sectionList, trainingList] = await Promise.all([
        base44.entities.Contractor.list("-created_date"),
        base44.entities.User.list("-created_date"),
        base44.entities.NavPermission.list("-created_date"),
        base44.entities.OnboardingSection.list("order"),
        base44.entities.Training.list("order"),
      ]);
      setItems(contractorList);
      setUsers(userList);
      setOnboardingSections(sectionList);
      setTrainings(trainingList);
      const map = {};
      permList.forEach((p) => { map[p.user_id] = p; });
      setPermMap(map);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getUserForContractor = (c) => users.find((u) => u.email && c.email && u.email.toLowerCase() === c.email.toLowerCase());
  const isAccessDeactivated = (c) => {
    const u = getUserForContractor(c);
    if (!u) return false;
    const perm = permMap[u.id];
    return !!perm && (!perm.allowed_paths || perm.allowed_paths.trim() === "");
  };

  const getCompletionPct = (c) => {
    const u = getUserForContractor(c);
    if (!u) return null;
    const totalOnboarding = onboardingSections.reduce((acc, s) => {
      const itemCount = s.items ? s.items.split("\n").filter(Boolean).length : 0;
      const docCount = s.document_url ? 1 : 0;
      return acc + itemCount + docCount;
    }, 0);
    if (totalOnboarding === 0) return 0;
    return Math.min(100, Math.round((u.onboarding_completed?.length || 0) / totalOnboarding * 100));
  };

  const getTrainingPct = (c) => {
    const u = getUserForContractor(c);
    if (!u) return null;
    if (trainings.length === 0) return 0;
    return Math.min(100, Math.round((u.training_completed?.length || 0) / trainings.length * 100));
  };

  const openNew = () => { setEditing(null); setForm({ name: "", role: "", email: "", rate: "", assigned_clients: "", contract_status: "Active", employment_status: "Full Time", performance_notes: "", start_date: "", employee_id: "", folder_url: "" }); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, role: c.role, email: c.email || "", rate: c.rate || "", assigned_clients: c.assigned_clients || "", contract_status: c.contract_status || "Active", employment_status: c.employment_status || "Full Time", performance_notes: c.performance_notes || "", start_date: c.start_date || "", employee_id: c.employee_id || "", folder_url: c.folder_url || "" }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name || !form.role) return;
    if (editing) { await base44.entities.Contractor.update(editing.id, form); } else { await base44.functions.invoke('manageContractor', { action: 'create', data: form }); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Contractor updated" : "Contractor added" });
  };

  const remove = async (c) => { await base44.functions.invoke('manageContractor', { action: 'delete', contractor_id: c.id }); load(); toast({ title: "Contractor removed", description: c.email ? "Access revoked and account deleted" : undefined }); };

  const toggleAccess = async (c) => {
    const u = getUserForContractor(c);
    if (!u) {
      toast({ title: "No user account found", description: "This contractor has no linked user account.", variant: "destructive" });
      return;
    }
    setAccessLoading(c.id);
    try {
      const existing = permMap[u.id];
      const deactivated = !existing || (existing.allowed_paths && existing.allowed_paths.trim() !== "");
      if (deactivated) {
        // Deactivate: set allowed_paths to empty (only Dashboard visible)
        if (existing?.id) {
          await base44.entities.NavPermission.update(existing.id, { allowed_paths: "" });
        } else {
          const created = await base44.entities.NavPermission.create({ user_id: u.id, user_name: u.full_name || u.email, allowed_paths: "" });
          setPermMap({ ...permMap, [u.id]: created });
        }
        toast({ title: "Section access deactivated", description: `${c.name} can now only see the Dashboard.` });
      } else {
        // Reactivate: remove the restriction record (full access)
        if (existing?.id) {
          await base44.entities.NavPermission.delete(existing.id);
          const next = { ...permMap };
          delete next[u.id];
          setPermMap(next);
        }
        toast({ title: "Section access restored", description: `${c.name} has full access to all sections.` });
      }
      await load();
    } catch (e) {
      toast({ title: "Failed to update access", variant: "destructive" });
    }
    setAccessLoading(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Contractors ({items.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Contractor</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Rate</TableHead><TableHead>Employment</TableHead><TableHead>Contract</TableHead><TableHead>Section Access</TableHead><TableHead>Onboarding</TableHead><TableHead>Training</TableHead><TableHead className="w-28">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((c) => {
              const hasUser = !!getUserForContractor(c);
              const deactivated = isAccessDeactivated(c);
              const completionPct = hasUser ? getCompletionPct(c) : null;
              const trainingPct = hasUser ? getTrainingPct(c) : null;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.role}</TableCell>
                  <TableCell className="text-sm">{c.rate || "—"}</TableCell>
                  <TableCell className="text-sm">{c.employment_status || "—"}</TableCell>
                  <TableCell><StatusBadge status={c.contract_status} /></TableCell>
                  <TableCell>
                    {!hasUser
                      ? <Badge variant="outline" className="text-[10px] px-2 py-0 bg-muted text-muted-foreground border-border">No account</Badge>
                      : deactivated
                        ? <Badge variant="outline" className="text-[10px] px-2 py-0 bg-red-50 text-red-700 border-red-200">Deactivated</Badge>
                        : <Badge variant="outline" className="text-[10px] px-2 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-sm">
                    {completionPct === null
                      ? <span className="text-muted-foreground">—</span>
                      : <span className={`font-medium ${completionPct === 100 ? "text-emerald-600" : completionPct >= 50 ? "text-amber-600" : "text-muted-foreground"}`}>{completionPct}%</span>
                    }
                  </TableCell>
                  <TableCell className="text-sm">
                    {trainingPct === null
                      ? <span className="text-muted-foreground">—</span>
                      : <span className={`font-medium ${trainingPct === 100 ? "text-emerald-600" : trainingPct >= 50 ? "text-amber-600" : "text-muted-foreground"}`}>{trainingPct}%</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasUser || accessLoading === c.id}
                        onClick={() => toggleAccess(c)}
                        title={deactivated ? "Restore section access" : "Deactivate section access"}
                      >
                        {accessLoading === c.id
                          ? <div className="w-3.5 h-3.5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                          : deactivated
                            ? <ShieldOff className="w-3.5 h-3.5 text-red-500" />
                            : <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        }
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(c)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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