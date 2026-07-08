import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Save, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { navItems } from "@/lib/nav-items";
import { getNavIcon } from "@/lib/nav-icons";

export default function ContractorPermissions({ contractor }) {
  const [linkedUser, setLinkedUser] = useState(null);
  const [permRecord, setPermRecord] = useState(null);
  const [allowedPaths, setAllowedPaths] = useState(null); // null = full access
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allNavItems, setAllNavItems] = useState(navItems);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [navSecs, allUsers, permList] = await Promise.all([
          base44.entities.NavSection.list("order"),
          base44.entities.User.list("-created_date"),
          base44.entities.NavPermission.list("-created_date"),
        ]);

        if (navSecs.length > 0) {
          setAllNavItems(navSecs.map((s) => ({ ...s, icon: getNavIcon(s.icon) })));
        }

        const user = allUsers.find(
          (u) => u.email.toLowerCase() === (contractor.email || "").toLowerCase()
        );
        setLinkedUser(user);

        if (user) {
          const perm = permList.find((p) => p.user_id === user.id);
          if (perm) {
            setPermRecord(perm);
            setAllowedPaths(new Set((perm.allowed_paths || "").split(",").filter(Boolean)));
          }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [contractor.id, contractor.email]);

  const togglePath = (path) => {
    const current = allowedPaths ? new Set(allowedPaths) : new Set(allNavItems.map((n) => n.path));
    if (current.has(path)) current.delete(path);
    else current.add(path);
    setAllowedPaths(current);
  };

  const setAll = (on) => {
    setAllowedPaths(on ? new Set(allNavItems.map((n) => n.path)) : new Set());
  };

  const save = async () => {
    if (!linkedUser) return;
    setSaving(true);
    try {
      const pathsStr = Array.from(allowedPaths).join(",");
      if (permRecord?.id) {
        await base44.entities.NavPermission.update(permRecord.id, { allowed_paths: pathsStr });
      } else {
        const created = await base44.entities.NavPermission.create({
          user_id: linkedUser.id,
          user_name: linkedUser.full_name || linkedUser.email,
          allowed_paths: pathsStr,
        });
        setPermRecord(created);
      }
      toast({ title: "Permissions saved" });
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  const toggleAdmin = async () => {
    if (!linkedUser) return;
    const newRole = linkedUser.role === "admin" ? "user" : "admin";
    setSaving(true);
    try {
      await base44.entities.User.update(linkedUser.id, { role: newRole });
      setLinkedUser({ ...linkedUser, role: newRole });
      toast({ title: newRole === "admin" ? "Admin access granted" : "Admin access removed" });
    } catch (e) {
      toast({ title: "Failed to update role", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm mt-5">
        <CardContent className="py-10 flex items-center justify-center">
          <div className="w-5 h-5 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!linkedUser) {
    return (
      <Card className="border-0 shadow-sm mt-5">
        <CardContent className="py-6 px-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary uppercase tracking-wide">Nav Permissions</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            No user account linked to this contractor's email ({contractor.email || "none"}).
            Permissions can only be managed for contractors with a registered login.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mt-5">
      <CardContent className="py-6 px-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-primary uppercase tracking-wide">Nav Permissions</h3>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-sm">{linkedUser.full_name || linkedUser.email}</p>
            <p className="text-[11px] text-muted-foreground">Toggle which sections this staff member can access in the sidebar.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAll(true)}>Enable All</Button>
            <Button variant="outline" size="sm" onClick={() => setAll(false)}>Disable All</Button>
          </div>
        </div>

        <div className={`flex items-center justify-between px-4 py-3 rounded-lg border mb-3 ${linkedUser.role === "admin" ? "bg-navy-50 border-navy-200" : "bg-muted/40 border-border"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${linkedUser.role === "admin" ? "bg-navy-600" : "bg-muted"}`}>
              <Crown className={`w-4 h-4 ${linkedUser.role === "admin" ? "text-white" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-sm font-medium">Admin Access</p>
              <p className="text-[11px] text-muted-foreground">Grants full access to the Admin Panel and all features</p>
            </div>
          </div>
          <Switch checked={linkedUser.role === "admin"} onCheckedChange={toggleAdmin} disabled={saving} />
        </div>

        <div className="space-y-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const checked = allowedPaths ? allowedPaths.has(item.path) : true;
            return (
              <div key={item.path} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Switch checked={checked} onCheckedChange={() => togglePath(item.path)} />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t">
          <p className="text-[11px] text-muted-foreground">Dashboard is always visible</p>
          <Button onClick={save} disabled={saving} size="sm" className="gap-1">
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Permissions"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}