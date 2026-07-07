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
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", category: "Company Update", priority: "Medium", author: "", pinned: false });
  const { toast } = useToast();

  const load = () => base44.entities.Announcement.list("-created_date").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: "", content: "", category: "Company Update", priority: "Medium", author: "", pinned: false }); setDialogOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ title: a.title, content: a.content, category: a.category || "Company Update", priority: a.priority || "Medium", author: a.author || "", pinned: a.pinned || false }); setDialogOpen(true); };

  const save = async () => {
    if (!form.title || !form.content) return;
    if (editing) { await base44.entities.Announcement.update(editing.id, form); } else { await base44.entities.Announcement.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Announcement updated" : "Announcement posted" });
  };

  const remove = async (id) => { await base44.entities.Announcement.delete(id); load(); toast({ title: "Announcement deleted" }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Announcements ({items.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Post Announcement</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Pinned</TableHead><TableHead className="w-20">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium text-sm">{a.title}</TableCell>
                <TableCell className="text-sm">{a.category}</TableCell>
                <TableCell><StatusBadge status={a.priority} /></TableCell>
                <TableCell className="text-sm">{a.pinned ? "📌" : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(a.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Announcement" : "New Announcement"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Content *" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Company Update", "Policy Change", "New Client", "Process Update", "Team Reminder"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.pinned} onCheckedChange={(v) => setForm({ ...form, pinned: v })} />
              <span className="text-sm">Pin this announcement</span>
            </div>
            <Button onClick={save} className="w-full">{editing ? "Update" : "Post"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}