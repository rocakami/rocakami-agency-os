import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const DROPDOWNS = [
  { name: "Client Status", description: "Options for the Client status dropdown (Prospect, Active, etc.)" },
  { name: "Billing Status", description: "Options for the Project billing status dropdown" },
  { name: "Pipeline Status", description: "Options for the Sales Pipeline / project stage dropdown" },
  { name: "Industry", description: "Options for the Industry dropdown on client forms" },
  { name: "Project Category", description: "Options for the Project Category/Type dropdown on project forms" },
];

function DropdownManager({ dropdownName, description }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: "", color: "", order: 0 });
  const { toast } = useToast();

  const load = () =>
    base44.entities.DropdownOption.filter({ dropdown_name: dropdownName }, "order")
      .then(setOptions)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [dropdownName]);

  const openNew = () => {
    setEditing(null);
    setForm({ label: "", color: "", order: options.length });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ label: item.label || "", color: item.color || "", order: item.order ?? 0 });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.label) return;
    const payload = { ...form, dropdown_name: dropdownName };
    if (editing) {
      await base44.entities.DropdownOption.update(editing.id, payload);
    } else {
      await base44.entities.DropdownOption.create(payload);
    }
    setDialogOpen(false);
    load();
    toast({ title: editing ? "Option updated" : "Option created" });
  };

  const remove = async (id) => {
    await base44.entities.DropdownOption.delete(id);
    load();
    toast({ title: "Option deleted" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-semibold text-sm">{dropdownName}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button onClick={openNew} size="sm" variant="outline" className="gap-1">
          <Plus className="w-4 h-4" /> Add Option
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : options.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No options yet. Add one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Label</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((opt) => (
                <TableRow key={opt.id}>
                  <TableCell className="font-medium text-sm">{opt.label}</TableCell>
                  <TableCell>
                    {opt.color ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: opt.color }} />
                        <span className="text-xs font-mono text-muted-foreground">{opt.color}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{opt.order ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(opt)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(opt.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Option" : "New Option"} — {dropdownName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Label *</label>
              <Input
                placeholder="e.g. Active"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Color (optional)</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.color || "#3B82F6"}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-9 p-1"
                />
                <Input
                  placeholder="#3B82F6"
                  value={form.color || ""}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Used for pipeline chart colors</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Order</label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={save} className="w-full" disabled={!form.label}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDropdownOptions() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Dropdown Options</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage options for Client Status, Billing Status, Pipeline Status, Industry, and Project Category dropdowns
        </p>
      </div>
      {DROPDOWNS.map((dd) => (
        <DropdownManager key={dd.name} dropdownName={dd.name} description={dd.description} />
      ))}
    </div>
  );
}