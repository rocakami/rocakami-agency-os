import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Briefcase, Globe, Instagram, Linkedin, Facebook } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FIELDS = [
  { key: "company_name", label: "Company Name", placeholder: "ROCAKAMI", icon: null },
  { key: "website_url", label: "Website URL", placeholder: "https://www.rocakami.com/", icon: Globe },
  { key: "job_board_url", label: "Job Board URL", placeholder: "https://...", icon: Briefcase },
  { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/...", icon: Instagram },
  { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/...", icon: Linkedin },
  { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/...", icon: Facebook },
];

export default function AdminCompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const list = await base44.entities.CompanyProfile.list();
      if (list.length > 0) {
        setProfile(list[0]);
        setForm(list[0]);
      } else {
        setProfile(null);
        setForm({ company_name: "", website_url: "", job_board_url: "", instagram_url: "", linkedin_url: "", facebook_url: "" });
      }
    } catch (e) {
      toast({ title: "Error loading profile", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        await base44.entities.CompanyProfile.update(profile.id, form);
      } else {
        const created = await base44.entities.CompanyProfile.create(form);
        setProfile(created);
      }
      toast({ title: "Company profile saved" });
    } catch (e) {
      toast({ title: "Error saving profile", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm max-w-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Company Profile</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          These URLs power the icon links in the sidebar. Only add the ones you want shown.
        </p>
        <div className="space-y-3">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key}>
                <Label className="text-xs flex items-center gap-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {f.label}
                </Label>
                <Input
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="mt-1"
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}