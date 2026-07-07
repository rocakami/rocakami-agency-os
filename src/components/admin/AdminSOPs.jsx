import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

const categories = ["Sales", "Client Onboarding", "Website Project", "CRM & GHL", "SEO", "Customer Support", "Finance & Admin", "HR & Contractor", "Automation", "Quality Assurance"];

const emptyForm = { title: "", category: "Sales", department: "", owner: "", status: "Draft", google_doc_url: "" };

export default function AdminSOPs() {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const load = () => base44.entities.SOP.list("-updated_date").then(setSops).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (sop) => {
    setEditing(sop);
    setForm({
      title: sop.title || "",
      category: sop.category || "Sales",
      department: sop.department || "",
      owner: sop.owner || "",
      status: sop.status || "Draft",
      google_doc_url: sop.google_doc_url || "",
    });
    setDialogOpen(true);
  };

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
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Department</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {sops.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-sm">{s.title}</TableCell>
                <TableCell className="text-sm">{s.category}</TableCell>
                <TableCell className="text-sm">{s.department || "—"}</TableCell>
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
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{["Draft", "Active", "Needs Review"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <Input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Google Doc URL</label>
              <Input placeholder="https://docs.google.com/document/d/…" value={form.google_doc_url} onChange={(e) => setForm({ ...form, google_doc_url: e.target.value })} />
              <p className="text-[11px] text-muted-foreground">Paste a Google Doc share link — it will be embedded automatically in the SOP view.</p>
            </div>
            <Button onClick={save} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}