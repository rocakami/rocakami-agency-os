import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search, Building2, FolderOpen, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = {
  name: "", company_name: "", primary_contact: "", email: "", phone: "",
  website: "", address: "", industry: "", status: "Prospect",
  drive_folder_url: "", linkedin_url: "", facebook_url: "", instagram_url: "",
  twitter_url: "", youtube_url: "", notes: ""
};

export default function ClientDirectory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [generatingId, setGeneratingId] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [industries, setIndustries] = useState([]);
  const { toast } = useToast();

  const load = () => base44.entities.Client.list("-created_date").then(setItems).finally(() => setLoading(false));
  useEffect(() => {
    load();
    base44.entities.DropdownOption.filter({ dropdown_name: "Client Status" }, "order").then(setStatuses).catch(() => {});
    base44.entities.DropdownOption.filter({ dropdown_name: "Industry" }, "order").then(setIndustries).catch(() => {});
  }, []);

  const filtered = items.filter((c) =>
    !search ||
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.primary_contact?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "", company_name: c.company_name || "", primary_contact: c.primary_contact || "",
      email: c.email || "", phone: c.phone || "", website: c.website || "", address: c.address || "",
      industry: c.industry || "", status: c.status || "Prospect", drive_folder_url: c.drive_folder_url || "",
      linkedin_url: c.linkedin_url || "", facebook_url: c.facebook_url || "", instagram_url: c.instagram_url || "",
      twitter_url: c.twitter_url || "", youtube_url: c.youtube_url || "", notes: c.notes || ""
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.company_name) { toast({ title: "Company name is required", variant: "destructive" }); return; }
    if (editing) { await base44.entities.Client.update(editing.id, form); }
    else { await base44.entities.Client.create(form); }
    setDialogOpen(false); load();
    toast({ title: editing ? "Client updated" : "Client added" });
  };

  const remove = async (id) => { await base44.entities.Client.delete(id); load(); toast({ title: "Client removed" }); };

  const generateFolder = async (client) => {
    setGeneratingId(client.id);
    try {
      const res = await base44.functions.invoke('generateClientFolder', { client_id: client.id });
      toast({ title: "Folder created", description: res.data?.folder_url });
      load();
    } catch (err) {
      toast({ title: "Failed to create folder", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Client Directory" description="Company-focused client management with Drive folders and social profiles">
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Client</Button>
      </PageHeader>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by company, contact, or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No clients found" description="Add your first client to get started." />
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">POC</TableHead>
                  <TableHead className="font-semibold">Industry</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Website</TableHead>
                  <TableHead className="font-semibold">Folder</TableHead>
                  <TableHead className="font-semibold w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#1a3676]/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-[#1a3676]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{c.company_name || c.name || "—"}</p>
                          {c.name && c.company_name && <p className="text-[11px] text-muted-foreground">{c.name}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.primary_contact || c.email || c.phone ? (
                        <div>
                          {c.primary_contact && <p className="text-sm font-medium">{c.primary_contact}</p>}
                          {c.email && <p className="text-[11px] text-muted-foreground">{c.email}</p>}
                          {c.phone && <p className="text-[11px] text-muted-foreground">{c.phone}</p>}
                        </div>
                      ) : <span className="text-sm text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">{c.industry || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>
                      {c.website ? (
                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-sm text-[#1a3676] hover:underline">
                          {c.website.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 28)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-sm text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {c.drive_folder_url ? (
                        <a href={c.drive_folder_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[#1a3676] hover:underline">
                          <FolderOpen className="w-3.5 h-3.5" />
                          Open
                        </a>
                      ) : generatingId === c.id ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Creating…
                        </span>
                      ) : (
                        <button onClick={() => generateFolder(c)} className="inline-flex items-center gap-1 text-sm font-medium text-[#229ece] hover:underline">
                          <FolderOpen className="w-3.5 h-3.5" />
                          Generate
                        </button>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(c.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Client" : "New Client"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Company Details</p>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Company name *" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                <Select value={form.industry || "__none"} onValueChange={(v) => setForm({ ...form, industry: v === "__none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">— None —</SelectItem>
                    {industries.map((i) => <SelectItem key={i.id} value={i.label}>{i.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Company address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-3" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Point of Contact</p>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Primary contact role" value={form.primary_contact} onChange={(e) => setForm({ ...form, primary_contact: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Social Media</p>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
                <Input placeholder="Facebook URL" value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input placeholder="Instagram URL" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
                <Input placeholder="X (Twitter) URL" value={form.twitter_url} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input placeholder="YouTube URL" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Internal</p>
              <Input placeholder="Drive folder URL (auto-generated)" value={form.drive_folder_url} onChange={(e) => setForm({ ...form, drive_folder_url: e.target.value })} className="mb-3" />
              <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <Button onClick={save} className="w-full">{editing ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}