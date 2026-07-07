import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectFormDialog from "@/components/client-delivery/ProjectFormDialog";
import { useToast } from "@/components/ui/use-toast";

const STAGES = ["Intake", "Discovery", "Proposal", "Onboarding", "Active", "Closure"];

export default function KanbanBoard() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeStage, setActiveStage] = useState("All");
  const [generatingId, setGeneratingId] = useState(null);
  const { toast } = useToast();

  const load = () => base44.entities.ClientProject.list().then(setProjects).finally(() => setLoading(false));
  useEffect(() => {
    load();
    base44.entities.Client.list().then(setClients).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (project) => { setEditing(project); setDialogOpen(true); };

  const generateFolder = async (project) => {
    setGeneratingId(project.id);
    try {
      const res = await base44.functions.invoke("generateProjectFolder", { project_id: project.id });
      const folderUrl = res.data?.folder_url;
      if (folderUrl) {
        setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, folder_url: folderUrl } : p));
        toast({ title: "Folder generated" });
      } else {
        toast({ title: res.data?.error || "Failed to generate folder", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Failed to generate folder", variant: "destructive" });
    }
    setGeneratingId(null);
  };

  const filtered = projects.filter((p) => {
    const matchesStage = activeStage === "All" || p.stage === activeStage;
    const matchesSearch = !search ||
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.project_id || "").toLowerCase().includes(search.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const stageCounts = {
    All: projects.length,
    ...STAGES.reduce((acc, s) => { acc[s] = projects.filter((p) => p.stage === s).length; return acc; }, {}),
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const FILTERS = ["All", ...STAGES];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Project</Button>
      </div>

      {/* Stage filter bar */}
      <div className="border-b mb-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {FILTERS.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeStage === stage
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {stage}
              <span className="ml-1.5 text-xs text-muted-foreground">({stageCounts[stage] || 0})</span>
              {activeStage === stage && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[120px]">Project ID</TableHead>
              <TableHead>Project Title</TableHead>
              <TableHead className="w-[130px]">Start Date</TableHead>
              <TableHead className="w-[130px]">Due Date</TableHead>
              <TableHead className="w-[100px]">Stage</TableHead>
              <TableHead className="w-[120px]">Folder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => openEdit(p)}>
                  <TableCell className="font-mono text-xs">{p.project_id || "—"}</TableCell>
                  <TableCell>
                    <Link to={`/projects/${p.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-sm hover:text-sky-600">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.client_name} • {p.project_type || "—"}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(p.start_date)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(p.due_date)}</TableCell>
                  <TableCell><StatusBadge status={p.stage} /></TableCell>
                  <TableCell>
                    {p.folder_url ? (
                      <a
                        href={p.folder_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-sky-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Open
                      </a>
                    ) : generatingId === p.id ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Generating…
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); generateFolder(p); }}
                        className="text-xs text-sky-600 font-medium hover:underline"
                      >
                        Generate
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} clients={clients} onSaved={load} />
    </div>
  );
}