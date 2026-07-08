import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export default function AdminTraining() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", type: "Written Guide", role_path: "", content: "", video_url: "", completion_required: false, order: 0 });
  const { toast } = useToast();

  const load = () => base44.entities.Training.list("order").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: "", type: "Written Guide", role_path: "", content: "", video_url: "", completion_required: false, order: 0 }); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ title: t.title, type: t.type, role_path: t.role_path || "", content: t.content || "", video_url: t.video_url || "", completion_required: t.completion_required || false, order: t.order || 0 }); setDialogOpen(true); };

  const save = async () => {
    if (!form.title) return;
    if (editing) { await base44.entities.Training.update(editing.id, form); } else { await base44.entities.Training.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Training updated" : "Training added" });
  };

  const remove = async (id) => { await base44.entities.Training.delete(id); load(); toast({ title: "Training removed" }); };

  const toggleVisibility = async (t) => {
    await base44.entities.Training.update(t.id, { hidden: !t.hidden });
    load();
    toast({ title: !t.hidden ? "Training hidden from center" : "Training visible in center" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Training ({items.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Training</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Role Path</TableHead><TableHead>Required</TableHead><TableHead className="text-center">Visible</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-sm">{t.title}</TableCell>
                <TableCell className="text-sm">{t.type}</TableCell>
                <TableCell className="text-sm">{t.role_path || "—"}</TableCell>
                <TableCell className="text-sm">{t.completion_required ? "✅" : "—"}</TableCell>
                <TableCell className="text-center"><Switch checked={!t.hidden} onCheckedChange={() => toggleVisibility(t)} /></TableCell>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Training" : "New Training"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Video", "Written Guide", "Quiz", "Checklist"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Role path (e.g. Sales)" value={form.role_path} onChange={(e) => setForm({ ...form, role_path: e.target.value })} />
            </div>
            <Textarea placeholder="Content / description" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <Input placeholder="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
            <Input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.completion_required} onCheckedChange={(v) => setForm({ ...form, completion_required: v })} />
              <span className="text-sm">Completion required</span>
            </div>
            <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}