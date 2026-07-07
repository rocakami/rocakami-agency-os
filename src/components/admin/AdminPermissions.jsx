import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { navItems } from "@/lib/nav-items";
import { getNavIcon } from "@/lib/nav-icons";

export default function AdminPermissions() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allNavItems, setAllNavItems] = useState(navItems);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [userList, permList, navSecs] = await Promise.all([
          base44.entities.User.list("-created_date"),
          base44.entities.NavPermission.list("-created_date"),
          base44.entities.NavSection.list("order"),
        ]);
        const nonAdmins = userList.filter((u) => u.role !== "admin");
        setUsers(nonAdmins);
        const permMap = {};
        permList.forEach((p) => { permMap[p.user_id] = p; });
        setPermissions(permMap);
        if (nonAdmins.length > 0) setSelectedUserId(nonAdmins[0].id);
        if (navSecs.length > 0) {
          setAllNavItems(navSecs.map((s) => ({ ...s, icon: getNavIcon(s.icon) })));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const permRecord = selectedUserId ? permissions[selectedUserId] : null;
  const allowedSet = permRecord
    ? new Set((permRecord.allowed_paths || "").split(",").filter(Boolean))
    : null; // null = no record = all access

  const togglePath = (path) => {
    if (!selectedUserId) return;
    const current = allowedSet ? new Set(allowedSet) : new Set(allNavItems.map((n) => n.path));
    if (current.has(path)) current.delete(path);
    else current.add(path);
    setPermissions({
      ...permissions,
      [selectedUserId]: {
        ...(permRecord || { user_id: selectedUserId, user_name: selectedUser?.full_name || selectedUser?.email }),
        allowed_paths: Array.from(current).join(","),
      },
    });
  };

  const setAll = (on) => {
    if (!selectedUserId) return;
    const paths = on ? allNavItems.map((n) => n.path).join(",") : "";
    setPermissions({
      ...permissions,
      [selectedUserId]: {
        ...(permRecord || { user_id: selectedUserId, user_name: selectedUser?.full_name || selectedUser?.email }),
        allowed_paths: paths,
      },
    });
  };

  const save = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const rec = permissions[selectedUserId];
      if (rec && rec.id) {
        await base44.entities.NavPermission.update(rec.id, { allowed_paths: rec.allowed_paths });
      } else {
        const created = await base44.entities.NavPermission.create({
          user_id: selectedUserId,
          user_name: selectedUser?.full_name || selectedUser?.email || "",
          allowed_paths: rec?.allowed_paths || "",
        });
        setPermissions({ ...permissions, [selectedUserId]: created });
      }
      toast({ title: "Permissions saved" });
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  if (users.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No staff members found. Invite users from the dashboard to manage their permissions.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Staff Nav Permissions</h3>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* User list */}
        <div className="space-y-1">
          {users.map((u) => {
            const hasRestrictions = !!permissions[u.id];
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selectedUserId === u.id
                    ? "bg-navy-50 border-navy-200"
                    : "bg-white border-border hover:bg-muted/40"
                }`}
              >
                <p className="text-sm font-medium">{u.full_name || u.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {u.email && <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>}
                  {hasRestrictions
                    ? <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">Restricted</Badge>
                    : <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">Full Access</Badge>
                  }
                </div>
              </button>
            );
          })}
        </div>

        {/* Permission toggles */}
        <div className="lg:col-span-2">
          {selectedUser && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-sm">{selectedUser.full_name || selectedUser.email}</h4>
                    <p className="text-[11px] text-muted-foreground">Toggle which sections this staff member can access in the sidebar.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(true)}>Enable All</Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(false)}>Disable All</Button>
                  </div>
                </div>

                <div className="space-y-1">
                  {allNavItems.map((item) => {
                    const Icon = item.icon;
                    const checked = allowedSet ? allowedSet.has(item.path) : true;
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
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Check className="w-3 h-3" /> Dashboard is always visible
                  </p>
                  <Button onClick={save} disabled={saving} size="sm" className="gap-1">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Permissions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}