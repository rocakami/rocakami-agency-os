import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = { department: "", prefix: "", order: 0 };

export default function AdminPrefixes() {
  const [prefixes, setPrefixes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const load = () => base44.entities.DepartmentPrefix.list("order").then(setPrefixes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ department: item.department || "", prefix: item.prefix || "", order: item.order || 0 });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.department || !form.prefix) return;
    if (editing) { await base44.entities.DepartmentPrefix.update(editing.id, form); } else { await base44.entities.DepartmentPrefix.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Prefix updated" : "Prefix created" });
  };

  const remove = async (id) => { await base44.entities.DepartmentPrefix.delete(id); load(); toast({ title: "Prefix deleted" }); };

  const exampleFor = (prefix, idx) => `${prefix}-${String(idx + 1).padStart(3, "0")} Sample Title`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">Department Prefixes ({prefixes.length})</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage naming convention prefixes used across documents</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Prefix</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>
      ) : prefixes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Hash className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No prefixes yet. Add your first department prefix to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Department</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Example</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prefixes.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-sm">{p.department}</TableCell>
                  <TableCell className="text-sm"><span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs font-semibold">{p.prefix}</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono text-xs">{exampleFor(p.prefix, idx)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Prefix" : "New Prefix"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department *</label>
              <Input placeholder="e.g. Sales" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Prefix *</label>
              <Input placeholder="e.g. RK-SL" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })} />
              <p className="text-[11px] text-muted-foreground mt-1">Used in document IDs: {form.prefix || "RK-XX"}-001 Title</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Order</label>
              <Input type="number" placeholder="0" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <Button onClick={save} className="w-full" disabled={!form.department || !form.prefix}>{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}