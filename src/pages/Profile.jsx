import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Save, Badge, Link as LinkIcon, Calendar, ExternalLink, Briefcase, FileCheck } from "lucide-react";

const EMPTY = {
  name: "", role: "", email: "", phone: "", address: "",
  emergency_contact: "", rate: "", assigned_clients: "",
  performance_notes: "", start_date: ""
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      setUser(me);
      const matches = await base44.entities.Contractor.filter({ email: me.email });
      if (matches.length > 0) {
        const c = matches[0];
        setContractor(c);
        setForm({
          name: c.name || me.full_name || "",
          role: c.role || "",
          email: c.email || me.email || "",
          phone: c.phone || "",
          address: c.address || "",
          emergency_contact: c.emergency_contact || "",
          rate: c.rate || "",
          assigned_clients: c.assigned_clients || "",
          performance_notes: c.performance_notes || "",
          start_date: c.start_date || ""
        });
      } else {
        setForm({ ...EMPTY, name: me.full_name || "", email: me.email || "" });
      }
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (contractor) {
        await base44.entities.Contractor.update(contractor.id, form);
      } else {
        const created = await base44.entities.Contractor.create(form);
        setContractor(created);
      }
      toast({ title: "Profile saved successfully" });
    } catch (e) {
      toast({ title: "Error saving profile", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const adminFields = [
    { icon: Badge, label: "Employee ID", value: contractor?.employee_id },
    { icon: LinkIcon, label: "Personal Folder", value: contractor?.folder_url, isLink: true },
    { icon: Calendar, label: "Start Date", value: contractor?.start_date ? new Date(contractor.start_date).toLocaleDateString() : null },
    { icon: Briefcase, label: "Employment Status", value: contractor?.employment_status },
    { icon: FileCheck, label: "Contract Status", value: contractor?.contract_status }
  ].filter((d) => d.value);

  return (
    <div>
      <PageHeader title="My Account" description="Update your personal details — changes sync to your contractor record" />

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {/* Editable personal details */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="py-6 px-6 space-y-4">
            <div className="flex items-center gap-3 mb-2 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-navy-600 text-white flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-base">{form.name || "Your Name"}</p>
                <p className="text-xs text-muted-foreground">{form.email}</p>
                {!contractor && (
                  <p className="text-[11px] text-amber-600 mt-1">No contractor record yet — saving will create one.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Role / Title</label>
                <Input value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input value={form.email || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Address</label>
              <Textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Emergency Contact</label>
              <Input value={form.emergency_contact || ""} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Name & phone number" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Rate</label>
                <Input value={form.rate || ""} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <Input type="date" value={form.start_date || ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Assigned Clients</label>
              <Input value={form.assigned_clients || ""} onChange={(e) => setForm({ ...form, assigned_clients: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Textarea value={form.performance_notes || ""} onChange={(e) => setForm({ ...form, performance_notes: e.target.value })} rows={3} />
            </div>

            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Read-only admin-assigned info */}
        <Card className="border-0 shadow-sm lg:col-span-1 lg:sticky lg:top-4">
          <CardContent className="py-6 px-6">
            <h3 className="font-semibold text-sm mb-1 text-muted-foreground uppercase tracking-wide">Employment Info</h3>
            <p className="text-[11px] text-muted-foreground/70 mb-4">Assigned by admin</p>

            {adminFields.length === 0 ? (
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <p className="text-xs text-muted-foreground">No employment details assigned yet. An admin will assign these after onboarding.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminFields.map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-navy-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{d.label}</p>
                        {d.isLink ? (
                          <a href={d.value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sky-600 hover:underline break-all inline-flex items-center gap-1">
                            Open Folder <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <p className="text-sm font-medium">{d.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}