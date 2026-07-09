import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Pencil, FolderOpen, Briefcase, UserCheck,
  Mail, Phone, Globe, MapPin, Building2, ExternalLink, Loader2, Calendar, CalendarClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import ClientNotes from "@/components/client-delivery/ClientNotes";
import { useToast } from "@/components/ui/use-toast";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [generatingFolder, setGeneratingFolder] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Client.get(id),
      base44.entities.ClientProject.list("-created_date"),
      base44.entities.Contractor.list("-created_date"),
    ])
      .then(([c, projs, cons]) => {
        setClient(c);
        setForm(c);
        const matchName = c.name?.toLowerCase();
        const matchCompany = c.company_name?.toLowerCase();
        const clientProjects = projs.filter((p) =>
          p.client_name &&
          (p.client_name.toLowerCase() === matchName ||
            (matchCompany && p.client_name.toLowerCase() === matchCompany))
        );
        setProjects(clientProjects);
        const assignedNames = [...new Set(clientProjects.flatMap((p) =>
          (p.assigned_to || "").split(",").map((n) => n.trim()).filter(Boolean)
        ))];
        const staff = cons.filter((c) =>
          c.name && assignedNames.some((n) => n.toLowerCase() === c.name.toLowerCase())
        );
        setContractors(staff);
      })
      .finally(() => setLoading(false));
    base44.entities.DropdownOption.filter({ dropdown_name: "Client Status" }, "order").then(setStatuses).catch(() => {});
    base44.entities.DropdownOption.filter({ dropdown_name: "Industry" }, "order").then(setIndustries).catch(() => {});
  }, [id]);

  const save = async () => {
    await base44.entities.Client.update(id, form);
    setClient(form);
    setEditOpen(false);
    toast({ title: "Client updated" });
  };

  const generateFolder = async () => {
    setGeneratingFolder(true);
    try {
      const res = await base44.functions.invoke('generateClientFolder', { client_id: id });
      const updated = { ...client, drive_folder_url: res.data?.folder_url };
      setClient(updated);
      toast({ title: "Folder created", description: res.data?.folder_url });
    } catch (err) {
      toast({ title: "Failed to create folder", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingFolder(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  if (!client) {
    return <EmptyState icon={Building2} title="Client not found" description="This client may have been removed." />;
  }

  const socialLinks = [
    { url: client.linkedin_url, label: "LinkedIn" },
    { url: client.facebook_url, label: "Facebook" },
    { url: client.instagram_url, label: "Instagram" },
    { url: client.twitter_url, label: "X (Twitter)" },
    { url: client.youtube_url, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <div>
      <button onClick={() => navigate("/clients")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      <PageHeader title={client.company_name || client.name} description={client.name && client.company_name ? `Contact: ${client.name}` : "Client"}>
        <StatusBadge status={client.status} />
        {client.drive_folder_url ? (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(client.drive_folder_url, "_blank")}>
            <FolderOpen className="w-4 h-4" /> Drive Folder
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1" onClick={generateFolder} disabled={generatingFolder}>
            {generatingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
            {generatingFolder ? "Creating…" : "Generate Folder"}
          </Button>
        )}
        <Button size="sm" className="gap-1" onClick={() => { setForm(client); setEditOpen(true); }}>
          <Pencil className="w-4 h-4" /> Edit
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="delivery">Client Delivery ({projects.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({contractors.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Contact Info</h3>
                {client.primary_contact && (
                  <div className="flex items-center gap-2 text-sm"><UserCheck className="w-4 h-4 text-muted-foreground" /> {client.primary_contact}</div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /> {client.email}</div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /> {client.phone}</div>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                    <Globe className="w-4 h-4" /> {client.website}
                  </a>
                )}
                {!client.primary_contact && !client.email && !client.phone && !client.website && (
                  <p className="text-sm text-muted-foreground">No contact info added.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Business Info</h3>
                {client.industry && (
                  <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-muted-foreground" /> {client.industry}</div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5" /> {client.address}</div>
                )}
                {client.contract_start_date && (
                  <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" /> Start: {new Date(client.contract_start_date).toLocaleDateString()}</div>
                )}
                {client.contract_expiration_date && (
                  <div className="flex items-center gap-2 text-sm"><CalendarClock className="w-4 h-4 text-muted-foreground" /> Expires: {new Date(client.contract_expiration_date).toLocaleDateString()}</div>
                )}
                {client.drive_folder_url && (
                  <a href={client.drive_folder_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                    <FolderOpen className="w-4 h-4" /> Open Drive Folder
                  </a>
                )}
                {!client.industry && !client.address && !client.drive_folder_url && !client.contract_start_date && !client.contract_expiration_date && (
                  <p className="text-sm text-muted-foreground">No business info added.</p>
                )}
              </CardContent>
            </Card>

            {socialLinks.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Social Media</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((s) => (
                      <a key={s.label} href={s.url.startsWith('http') ? s.url : `https://${s.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 text-sm transition-colors">
                        <ExternalLink className="w-4 h-4 text-[#1a3676]" />
                        <span>{s.label}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-sm sm:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">Notes</h3>
                {client.notes && (
                  <p className="text-sm text-foreground whitespace-pre-wrap mb-4 pb-4 border-b">{client.notes}</p>
                )}
                <ClientNotes clientId={id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Delivery */}
        <TabsContent value="delivery">
          {projects.length === 0 ? (
            <EmptyState icon={Briefcase} title="No delivery projects" description="Client Delivery items tagged to this client will appear here." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm hover:text-sky-600 transition-colors">{p.title}</h4>
                        <StatusBadge status={p.stage} />
                      </div>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">{p.assigned_to || "Unassigned"}</span>
                        {p.due_date && <span className="text-xs text-muted-foreground">{new Date(p.due_date).toLocaleDateString()}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Staff */}
        <TabsContent value="staff">
          {contractors.length === 0 ? (
            <EmptyState icon={UserCheck} title="No staff assigned" description="Staff assigned to this client's projects will appear here." />
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left font-semibold p-3">Name</th>
                      <th className="text-left font-semibold p-3">Role</th>
                      <th className="text-left font-semibold p-3">Rate</th>
                      <th className="text-left font-semibold p-3">Contract</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractors.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">
                          <Link to={`/contractors/${c.id}`} className="text-sky-600 hover:underline">{c.name}</Link>
                        </td>
                        <td className="p-3">{c.role}</td>
                        <td className="p-3">{c.rate || "—"}</td>
                        <td className="p-3"><StatusBadge status={c.contract_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Client name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Company name" value={form.company_name || ""} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Primary contact" value={form.primary_contact || ""} onChange={(e) => setForm({ ...form, primary_contact: e.target.value })} />
              <Select value={form.industry || "__none"} onValueChange={(v) => setForm({ ...form, industry: v === "__none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— None —</SelectItem>
                  {industries.map((i) => <SelectItem key={i.id} value={i.label}>{i.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Website" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <Select value={form.status || "Prospect"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="LinkedIn URL" value={form.linkedin_url || ""} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
              <Input placeholder="Facebook URL" value={form.facebook_url || ""} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Instagram URL" value={form.instagram_url || ""} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
              <Input placeholder="X (Twitter) URL" value={form.twitter_url || ""} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} />
            </div>
            <Input placeholder="YouTube URL" value={form.youtube_url || ""} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Contract Start</label>
                <Input type="date" value={form.contract_start_date || ""} onChange={(e) => setForm({ ...form, contract_start_date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Contract Expiration</label>
                <Input type="date" value={form.contract_expiration_date || ""} onChange={(e) => setForm({ ...form, contract_expiration_date: e.target.value })} />
              </div>
            </div>
            <Input placeholder="Drive folder URL (auto-generated)" value={form.drive_folder_url || ""} onChange={(e) => setForm({ ...form, drive_folder_url: e.target.value })} />
            <Textarea placeholder="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Textarea placeholder="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button onClick={save} className="w-full">Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}