import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { ICON_OPTIONS, getNavIcon } from "@/lib/nav-icons";

const COLORS = [
  { label: "Navy", value: "bg-navy-600" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Sky", value: "bg-sky-400" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Teal", value: "bg-teal-500" }
];

const blank = { title: "", icon: "Heart", color: "bg-navy-600", content: "", items: "", order: 0 };

export default function AdminOnboarding() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const { toast } = useToast();

  const load = () => base44.entities.OnboardingSection.list("order").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setDialogOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ title: s.title, icon: s.icon || "Heart", color: s.color || "bg-navy-600", content: s.content || "", items: s.items || "", order: s.order || 0 });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title) return;
    if (editing) { await base44.entities.OnboardingSection.update(editing.id, form); } else { await base44.entities.OnboardingSection.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Section updated" : "Section added" });
  };

  const remove = async (id) => { await base44.entities.OnboardingSection.delete(id); load(); toast({ title: "Section removed" }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Onboarding Sections ({items.length})</h3>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Section</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => {
              const Icon = getNavIcon(s.icon);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-sm flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md ${s.color} text-white flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {s.title}
                  </TableCell>
                  <TableCell className="text-sm">{s.icon}</TableCell>
                  <TableCell className="text-sm">{s.order ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(s.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Section" : "New Section"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Icon</label>
                <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ICON_OPTIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Color</label>
                <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COLORS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Textarea placeholder="Content (paragraph text)" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="space-y-1">
              <Textarea placeholder="Items (one per line, for checklist/bulleted sections)" rows={4} value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
              <p className="text-xs text-muted-foreground">Tip: To add a document link, use the format: Item text | https://link.com</p>
            </div>
            <Input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}