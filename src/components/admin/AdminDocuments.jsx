import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

const categories = ["Company Policies", "Client Templates", "Proposal Templates", "Contracts", "Internal Checklists", "Training Materials", "Brand Assets", "Meeting Notes"];

export default function AdminDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Company Policies", description: "", owner: "", status: "Active", file_url: "" });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = () => base44.entities.Document.list("-updated_date").then(setDocs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: "", category: "Company Policies", description: "", owner: "", status: "Active", file_url: "" }); setDialogOpen(true); };
  const openEdit = (doc) => { setEditing(doc); setForm({ title: doc.title, category: doc.category, description: doc.description || "", owner: doc.owner || "", status: doc.status || "Active", file_url: doc.file_url || "" }); setDialogOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, file_url });
    setUploading(false);
  };

  const save = async () => {
    if (!form.title) return;
    if (editing) { await base44.entities.Document.update(editing.id, form); } else { await base44.entities.Document.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Document updated" : "Document created" });
  };

  const remove = async (id) => { await base44.entities.Document.delete(id); load(); toast({ title: "Document deleted" }); };

  const toggleVisibility = async (doc) => {
    await base44.entities.Document.update(doc.id, { hidden: !doc.hidden });
    load();
    toast({ title: !doc.hidden ? "Document hidden from repository" : "Document visible in repository" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Documents ({docs.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Document</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Visible</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {docs.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium text-sm">{d.title}</TableCell>
                <TableCell className="text-sm">{d.category}</TableCell>
                <TableCell className="text-sm">{d.owner || "—"}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
                <TableCell className="text-center"><Switch checked={!d.hidden} onCheckedChange={() => toggleVisibility(d)} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(d.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Document" : "New Document"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Active", "Draft", "Archived"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            <div>
              <label className="block text-sm font-medium mb-1">File</label>
              <input type="file" onChange={handleUpload} className="text-sm mb-2" />
              {uploading && <p className="text-xs text-muted-foreground mb-1">Uploading…</p>}
              <Input placeholder="Or paste a file link / URL" value={form.file_url || ""} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
            </div>
            <Button onClick={save} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}