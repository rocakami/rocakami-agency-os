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

export default function AdminTools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", purpose: "", access_instructions: "", owner: "", related_sops: "", best_practices: "", url: "", username: "", password: "" });
  const [contractors, setContractors] = useState([]);
  const [sops, setSops] = useState([]);
  const { toast } = useToast();

  const load = () => base44.entities.ToolEntry.list().then(setItems).finally(() => setLoading(false));
  useEffect(() => {
    load();
    base44.entities.Contractor.list().then(setContractors).catch(() => {});
    base44.entities.SOP.filter({ hidden: false }).then(setSops).catch(() => {});
  }, []);

  const parseSopIds = (val) => {
    if (!val) return [];
    return String(val).split(",").map((s) => s.trim()).filter(Boolean);
  };

  const toggleSop = (sopId) => {
    const current = parseSopIds(form.related_sops);
    const next = current.includes(sopId) ? current.filter((s) => s !== sopId) : [...current, sopId];
    setForm({ ...form, related_sops: next.join(",") });
  };

  const openNew = () => { setEditing(null); setForm({ name: "", purpose: "", access_instructions: "", owner: "", related_sops: "", best_practices: "", url: "", username: "", password: "" }); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, purpose: t.purpose || "", access_instructions: t.access_instructions || "", owner: t.owner || "", related_sops: t.related_sops || "", best_practices: t.best_practices || "", url: t.url || "", username: t.username || "", password: t.password || "" }); setDialogOpen(true); };

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
            <Select value={form.owner || "__none"} onValueChange={(v) => setForm({ ...form, owner: v === "__none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Owner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— None —</SelectItem>
                {contractors.filter((c) => c.employment_category === "Manager" || c.employment_category === "Lead").map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              <Input placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">REFERENCE — Related SOPs</label>
              <Select value="__placeholder__" onValueChange={toggleSop}>
                <SelectTrigger>
                  <SelectValue placeholder={parseSopIds(form.related_sops).length > 0 ? `${parseSopIds(form.related_sops).length} selected` : "Select SOPs"} />
                </SelectTrigger>
                <SelectContent>
                  {sops.length === 0
                    ? <SelectItem value="__none" disabled>No SOPs available</SelectItem>
                    : sops.map((s) => {
                      const selected = parseSopIds(form.related_sops).includes(s.id);
                      return (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded border flex items-center justify-center ${selected ? "bg-primary border-primary" : "border-input"}`}>
                              {selected && <span className="text-white text-[8px]">✓</span>}
                            </span>
                            {s.title}
                          </span>
                        </SelectItem>
                      );
                    })
                  }
                </SelectContent>
              </Select>
              {parseSopIds(form.related_sops).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {parseSopIds(form.related_sops).map((id) => {
                    const sop = sops.find((s) => s.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5">
                        {sop ? sop.title : id}
                        <button type="button" onClick={() => toggleSop(id)} className="text-muted-foreground hover:text-destructive">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <Textarea placeholder="Best practices" value={form.best_practices} onChange={(e) => setForm({ ...form, best_practices: e.target.value })} />
            <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}