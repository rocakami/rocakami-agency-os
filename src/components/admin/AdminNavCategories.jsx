import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { navItems } from "@/lib/nav-items";

export default function AdminNavCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.NavCategory.list("order")
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const assignedPaths = new Set(categories.flatMap((c) => (c.nav_paths || "").split(",").filter(Boolean)));
  const unassigned = navItems.filter((n) => !assignedPaths.has(n.path));

  const addCategory = () => {
    setCategories([...categories, { name: "", order: categories.length, nav_paths: "", _new: true }]);
  };

  const updateCategory = (idx, field, value) => {
    const next = [...categories];
    next[idx] = { ...next[idx], [field]: value };
    setCategories(next);
  };

  const togglePath = (idx, path) => {
    const cat = categories[idx];
    const current = new Set((cat.nav_paths || "").split(",").filter(Boolean));
    if (current.has(path)) current.delete(path);
    else current.add(path);
    updateCategory(idx, "nav_paths", Array.from(current).join(","));
  };

  const removeCategory = (idx) => {
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

  const save = async () => {
    setSaving(true);
    try {
      const existingIds = new Set(categories.filter((c) => c.id).map((c) => c.id));
      const all = await base44.entities.NavCategory.list();
      for (const old of all) {
        if (!existingIds.has(old.id)) {
          await base44.entities.NavCategory.delete(old.id);
        }
      }
      for (let i = 0; i < categories.length; i++) {
        const cat = { ...categories[i], order: i };
        delete cat._new;
        if (cat.id) {
          await base44.entities.NavCategory.update(cat.id, { name: cat.name, order: cat.order, nav_paths: cat.nav_paths || "" });
        } else {
          await base44.entities.NavCategory.create({ name: cat.name, order: cat.order, nav_paths: cat.nav_paths || "" });
        }
      }
      const refreshed = await base44.entities.NavCategory.list("order");
      setCategories(refreshed);
      toast({ title: "Nav categories saved" });
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2"><GripVertical className="w-4 h-4" /> Sidebar Categories</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addCategory} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Category</Button>
          <Button onClick={save} disabled={saving} size="sm" className="gap-1"><Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Create category headers (e.g. "Operations") and assign nav items to each. Unassigned items appear without a header. Drag order with the arrows.</p>

      {categories.length === 0 && unassigned.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">No categories yet. Click "Add Category" to create one.</CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {categories.map((cat, idx) => {
          const catPaths = new Set((cat.nav_paths || "").split(",").filter(Boolean));
          return (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex flex-col">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveCategory(idx, -1)} disabled={idx === 0}>▲</Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveCategory(idx, 1)} disabled={idx === categories.length - 1}>▼</Button>
                  </div>
                  <Input
                    placeholder="Category name (e.g. Operations)"
                    value={cat.name}
                    onChange={(e) => updateCategory(idx, "name", e.target.value)}
                    className="font-semibold uppercase tracking-wide text-sm max-w-xs"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeCategory(idx)} className="ml-auto text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const checked = catPaths.has(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => togglePath(idx, item.path)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          checked ? "bg-navy-50 border-navy-200 font-medium" : "bg-white border-border hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        <Switch checked={checked} className="ml-auto scale-75" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {unassigned.length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Unassigned (no category header)</p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.path} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}