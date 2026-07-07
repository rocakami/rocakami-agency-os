import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export default function AdminTools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", purpose: "", access_instructions: "", owner: "", related_sops: "", best_practices: "", url: "" });
  const { toast } = useToast();

  const load = () => base44.entities.ToolEntry.list().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", purpose: "", access_instructions: "", owner: "", related_sops: "", best_practices: "", url: "" }); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, purpose: t.purpose || "", access_instructions: t.access_instructions || "", owner: t.owner || "", related_sops: t.related_sops || "", best_practices: t.best_practices || "", url: t.url || "" }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) return;
    if (editing) { await base44.entities.ToolEntry.update(editing.id, form); } else { await base44.entities.ToolEntry.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Tool updated" : "Tool added" });
  };

  const remove = async (id) => { await base44.entities.ToolEntry.delete(id); load(); toast({ title: "Tool removed" }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Tools ({items.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Tool</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Purpose</TableHead><TableHead>Owner</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-sm">{t.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{t.purpose || "—"}</TableCell>
                <TableCell className="text-sm">{t.owner || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(t.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Tool" : "New Tool"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Tool name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <Textarea placeholder="Access / login instructions" value={form.access_instructions} onChange={(e) => setForm({ ...form, access_instructions: e.target.value })} />
            <Input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            <Input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <Input placeholder="Related SOPs" value={form.related_sops} onChange={(e) => setForm({ ...form, related_sops: e.target.value })} />
            <Textarea placeholder="Best practices" value={form.best_practices} onChange={(e) => setForm({ ...form, best_practices: e.target.value })} />
            <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}