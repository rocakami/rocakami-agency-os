import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, GripVertical, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { navItems } from "@/lib/nav-items";
import { ICON_OPTIONS } from "@/lib/nav-icons";

export default function AdminNavCategories() {
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      base44.entities.NavCategory.list("order"),
      base44.entities.NavSection.list("order")
    ])
      .then(([cats, secs]) => {
        setCategories(cats);
        if (secs.length > 0) setSections(secs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // --- Category management ---
  const addCategory = () => {
    setCategories([...categories, { name: "", order: categories.length, nav_paths: "", _new: true }]);
  };
  const updateCategory = (idx, field, value) => {
    const next = [...categories];
    next[idx] = { ...next[idx], [field]: value };
    setCategories(next);
  };
  const removeCategory = (idx) => {
    const catName = categories[idx].name;
    // Unassign sections from this category
    setSections(sections.map((s) => s.category_name === catName ? { ...s, category_name: "" } : s));
    setCategories(categories.filter((_, i) => i !== idx));
  };
  const moveCategory = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((c, i) => (c.order = i));
    setCategories(next);
  };

  // --- Section management ---
  const addSection = (categoryName = "") => {
    setEditSection({ label: "", path: "", icon: "LayoutDashboard", category_name: categoryName, order: sections.length, _isNew: true });
  };
  const saveSection = () => {
    if (!editSection.label.trim() || !editSection.path.trim()) {
      toast({ title: "Label and path are required", variant: "destructive" });
      return;
    }
    if (editSection._isNew) {
      setSections([...sections, { ...editSection, _isNew: false }]);
    } else {
      setSections(sections.map((s) => s._editKey === editSection._editKey ? editSection : s));
    }
    setEditSection(null);
  };
  const editExistingSection = (idx) => {
    setEditSection({ ...sections[idx], _editKey: idx, _isNew: false });
  };
  const removeSection = (idx) => {
    setSections(sections.filter((_, i) => i !== idx));
  };
  const moveSection = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((s, i) => (s.order = i));
    setSections(next);
  };

  // --- Save all to DB ---
  const save = async () => {
    setSaving(true);
    try {
      // Save categories
      const existingCatIds = new Set(categories.filter((c) => c.id).map((c) => c.id));
      const allCats = await base44.entities.NavCategory.list();
      for (const old of allCats) {
        if (!existingCatIds.has(old.id)) await base44.entities.NavCategory.delete(old.id);
      }
      const savedCats = [];
      for (let i = 0; i < categories.length; i++) {
        const cat = { ...categories[i], order: i };
        delete cat._new;
        if (cat.id) {
          await base44.entities.NavCategory.update(cat.id, { name: cat.name, order: cat.order, nav_paths: cat.nav_paths || "" });
          savedCats.push({ ...cat });
        } else {
          const created = await base44.entities.NavCategory.create({ name: cat.name, order: cat.order, nav_paths: cat.nav_paths || "" });
          savedCats.push(created);
        }
      }
      setCategories(savedCats);

      // Save sections
      const existingSecIds = new Set(sections.filter((s) => s.id).map((s) => s.id));
      const allSecs = await base44.entities.NavSection.list();
      for (const old of allSecs) {
        if (!existingSecIds.has(old.id)) await base44.entities.NavSection.delete(old.id);
      }
      const savedSecs = [];
      for (let i = 0; i < sections.length; i++) {
        const sec = { ...sections[i], order: i };
        delete sec._isNew;
        delete sec._editKey;
        if (sec.id) {
          await base44.entities.NavSection.update(sec.id, { label: sec.label, path: sec.path, icon: sec.icon || "Circle", order: sec.order, category_name: sec.category_name || "" });
          savedSecs.push({ ...sec });
        } else {
          const created = await base44.entities.NavSection.create({ label: sec.label, path: sec.path, icon: sec.icon || "Circle", order: sec.order, category_name: sec.category_name || "" });
          savedSecs.push(created);
        }
      }
      setSections(savedSecs);

      toast({ title: "Nav sections & categories saved" });
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  // Group sections by category
  const uncategorizedSections = sections.filter((s) => !s.category_name);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2"><GripVertical className="w-4 h-4" /> Sidebar Sections & Categories</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addSection} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Section</Button>
          <Button variant="outline" size="sm" onClick={addCategory} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Category</Button>
          <Button onClick={save} disabled={saving} size="sm" className="gap-1"><Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save All"}</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Create categories to group your nav links. Sections are listed under their assigned category. Unassigned sections appear at the bottom.</p>

      {/* Categories with nested sections */}
      <div className="space-y-4">
        {categories.map((cat, catIdx) => {
          const catSections = sections
            .map((s, i) => ({ ...s, _origIdx: i }))
            .filter((s) => s.category_name === cat.name);
          return (
            <div key={catIdx} className="rounded-xl border border-border overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-navy-50 border-b border-border">
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveCategory(catIdx, -1)} disabled={catIdx === 0}>▲</Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveCategory(catIdx, 1)} disabled={catIdx === categories.length - 1}>▼</Button>
                </div>
                <Input
                  placeholder="Category name (e.g. Operations)"
                  value={cat.name}
                  onChange={(e) => {
                    const oldName = cat.name;
                    updateCategory(catIdx, "name", e.target.value);
                    setSections(sections.map((s) => s.category_name === oldName ? { ...s, category_name: e.target.value } : s));
                  }}
                  className="font-semibold uppercase tracking-wide text-sm max-w-xs bg-white"
                />
                <Button variant="ghost" size="sm" onClick={() => addSection(cat.name)} className="ml-auto gap-1 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeCategory(catIdx)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {/* Sections under this category */}
              <div className="p-2 space-y-1 bg-white">
                {catSections.map((sec) => (
                  <div key={sec._origIdx} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex flex-col">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveSection(sec._origIdx, -1)} disabled={sec._origIdx === 0}>▲</Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveSection(sec._origIdx, 1)} disabled={sec._origIdx === sections.length - 1}>▼</Button>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs">
                      {sec.icon?.slice(0, 2) || "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sec.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{sec.path}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => editExistingSection(sec._origIdx)} className="text-muted-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeSection(sec._origIdx)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {catSections.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">No sections in this category yet.</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Uncategorized sections */}
        {uncategorizedSections.length > 0 && (
          <div className="rounded-xl border border-dashed border-border overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 border-b border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Uncategorized</p>
              <Button variant="ghost" size="sm" onClick={() => addSection("")} className="ml-auto gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Section
              </Button>
            </div>
            <div className="p-2 space-y-1 bg-white">
              {uncategorizedSections.map((sec) => {
                const idx = sections.indexOf(sec);
                return (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex flex-col">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>▲</Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}>▼</Button>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs">
                      {sec.icon?.slice(0, 2) || "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sec.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{sec.path}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => editExistingSection(idx)} className="text-muted-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeSection(idx)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {categories.length === 0 && sections.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              No categories or sections yet. Click "Add Category" or "Add Section" to get started.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Add section dialog */}
      <Dialog open={!!editSection} onOpenChange={(open) => !open && setEditSection(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editSection?._isNew ? "Add Section" : "Edit Section"}</DialogTitle>
          </DialogHeader>
          {editSection && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Label</label>
                <Input
                  placeholder="e.g. Dashboard"
                  value={editSection.label}
                  onChange={(e) => setEditSection({ ...editSection, label: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Path (route or URL)</label>
                <Input
                  placeholder="e.g. /dashboard or https://…"
                  value={editSection.path}
                  onChange={(e) => setEditSection({ ...editSection, path: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon</label>
                <Select value={editSection.icon} onValueChange={(v) => setEditSection({ ...editSection, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <Select value={editSection.category_name || "none"} onValueChange={(v) => setEditSection({ ...editSection, category_name: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.filter((c) => c.name.trim()).map((c, i) => <SelectItem key={i} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
            <Button onClick={saveSection}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}