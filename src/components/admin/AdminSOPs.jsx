import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

const fallbackCategories = ["Sales", "Client Onboarding", "Website Project", "CRM & GHL", "SEO", "Customer Support", "Finance & Admin", "HR & Contractor", "Automation", "Quality Assurance"];

const emptyForm = { title: "", category: "Sales", department: "", document_id: "", owner: "", status: "Draft", google_doc_url: "" };

export default function AdminSOPs() {
  const [sops, setSops] = useState([]);
  const [deptPrefixes, setDeptPrefixes] = useState([]);
  const [sopCategories, setSopCategories] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [generatingId, setGeneratingId] = useState(false);
  const [generatingRowId, setGeneratingRowId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const [sopList, prefixList, categoryList, contractorList] = await Promise.all([
      base44.entities.SOP.list("-updated_date"),
      base44.entities.DepartmentPrefix.list("order"),
      base44.entities.SopCategory.list("order"),
      base44.entities.Contractor.list("-created_date", 500)
    ]);
    setSops(sopList);
    setDeptPrefixes(prefixList);
    setSopCategories(categoryList);
    // Managers and supervisors from Contractors data
    const filtered = contractorList.filter((c) =>
      c.employment_category === "Manager" ||
      (c.role && c.role.toLowerCase().includes("supervisor"))
    );
    setManagers(filtered);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (sop) => {
    setEditing(sop);
    setForm({
      title: sop.title || "",
      category: sop.category || "Sales",
      department: sop.department || "",
      document_id: sop.document_id || "",
      owner: sop.owner || "",
      status: sop.status || "Draft",
      google_doc_url: sop.google_doc_url || "",
    });
    setDialogOpen(true);
  };

  const generateForSop = async (sop) => {
    if (sop.document_id) return;
    setGeneratingRowId(sop.id);
    try {
      const res = await base44.functions.invoke("generateSopId", {});
      const documentId = res.data.document_id;
      await base44.entities.SOP.update(sop.id, { document_id: documentId });
      toast({ title: `Generated: ${documentId}` });
      load();
    } catch {
      toast({ title: "Could not generate SOP number", variant: "destructive" });
    }
    setGeneratingRowId(null);
  };

  const save = async () => {
    if (!form.title) return;
    const payload = { ...form };
    if (editing) { await base44.entities.SOP.update(editing.id, payload); } else { await base44.entities.SOP.create(payload); }
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
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Document ID</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Department</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Generate</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {sops.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-mono text-xs text-primary font-semibold whitespace-nowrap">{s.document_id || "—"}</TableCell>
                <TableCell className="font-medium text-sm">{s.title}</TableCell>
                <TableCell className="text-sm">{s.category}</TableCell>
                <TableCell className="text-sm">{s.department || "—"}</TableCell>
                <TableCell className="text-sm">{s.owner || "—"}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-center">
                  {s.document_id ? (
                    <span className="text-[11px] text-muted-foreground">✓ Done</span>
                  ) : generatingRowId === s.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" />
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => generateForSop(s)}>
                      <Sparkles className="w-3.5 h-3.5" /> Generate
                    </Button>
                  )}
                </TableCell>
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
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{(sopCategories.length ? sopCategories.map((c) => c.name) : fallbackCategories).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{["Draft", "Active", "Needs Review"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {deptPrefixes.map((p) => <SelectItem key={p.id} value={p.department}>{p.department} ({p.prefix})</SelectItem>)}
                  {deptPrefixes.length === 0 && <SelectItem value="_none" disabled>No prefixes configured</SelectItem>}
                </SelectContent>
              </Select>
              <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                <SelectTrigger><SelectValue placeholder="Owner" /></SelectTrigger>
                <SelectContent>
                  {managers.map((m) => <SelectItem key={m.id} value={m.name}>{m.name} — {m.role || m.employment_category}</SelectItem>)}
                  {managers.length === 0 && <SelectItem value="_none" disabled>No managers found</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">The SOP number (e.g. <span className="font-mono font-semibold">SOP RK-001</span>) is generated via the <span className="font-medium">Generate</span> button in the table after saving. Numbers are sequential and global — not tied to department.</p>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Google Doc URL</label>
              <Input placeholder="https://docs.google.com/document/d/…" value={form.google_doc_url} onChange={(e) => setForm({ ...form, google_doc_url: e.target.value })} />
              <p className="text-[11px] text-muted-foreground">Paste a Google Doc share link — it will be embedded automatically in the SOP view.</p>
            </div>
            <Button onClick={save} className="w-full" disabled={!form.title}>{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}