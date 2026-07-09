import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2, Lock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectFormDialog from "@/components/client-delivery/ProjectFormDialog";
import ProjectTasks from "@/components/client-delivery/ProjectTasks";
import ProjectGantt from "@/components/client-delivery/ProjectGantt";

const STAGES = ["Intake", "Discovery", "Proposal", "Onboarding", "Active", "Closure"];

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
}
function fmtMoney(v) {
  return v != null ? `$${Number(v).toLocaleString()}` : "—";
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    const [proj, taskList] = await Promise.all([
      base44.entities.ClientProject.get(id),
      base44.entities.Task.filter({ project_id: id }, "-created_date")
    ]);
    setProject(proj);
    setTasks(taskList);
    setLoading(false);
  };

  useEffect(() => {
    load();
    base44.auth.me().then(async (me) => {
      let manager = me.role === "admin";
      if (!manager) {
        const matches = await base44.entities.Contractor.filter({ email: me.email });
        if (matches.length > 0) {
          manager = (matches[0].role || "").toLowerCase().includes("manager");
        }
      }
      setIsManager(manager);
    }).catch(() => {});
    base44.entities.Client.list().then(setClients).catch(() => {});
    base44.entities.Contractor.list().then(setContractors).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Project not found.</p>
        <Link to="/client-delivery"><Button variant="outline">Back to Hub</Button></Link>
      </div>
    );
  }

  const generalFields = [
    { label: "Project ID", value: project.project_id || "—" },
    { label: "Client", value: project.client_name ? (
      (() => {
        const client = clients.find((c) => (c.company_name || c.name) === project.client_name);
        return client ? (
          <Link to={`/clients/${client.id}`} className="text-sky-600 hover:underline">{project.client_name}</Link>
        ) : project.client_name;
      })()
    ) : "—" },
    { label: "Stage", value: <StatusBadge status={project.stage} /> },
    { label: "Project Type", value: project.project_type || "—" },
    { label: "Priority", value: <StatusBadge status={project.priority} /> },
    { label: "Assigned To", value: project.assigned_to ? (
      <div className="flex flex-wrap gap-1">
        {project.assigned_to.split(",").map((name) => {
          const trimmed = name.trim();
          const contractor = contractors.find((c) => c.name === trimmed);
          return contractor ? (
            <Link key={trimmed} to={`/contractors/${contractor.id}`} className="text-xs bg-muted hover:bg-sky-100 hover:text-sky-700 rounded-full px-2 py-0.5 transition-colors">
              {trimmed}
            </Link>
          ) : (
            <span key={trimmed} className="text-xs bg-muted rounded-full px-2 py-0.5">{trimmed}</span>
          );
        })}
      </div>
    ) : "—" },
    { label: "Start Date", value: fmtDate(project.start_date) },
    { label: "Due Date", value: fmtDate(project.due_date) },
    { label: "Drive Folder", value: project.folder_url ? (
      <a href={project.folder_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:underline">
        Open Folder <ExternalLink className="w-3 h-3" />
      </a>
    ) : "—" },
  ];

  const adminFields = [
    { label: "Contract Value", value: fmtMoney(project.contract_value) },
    { label: "Budget", value: fmtMoney(project.budget) },
    { label: "Billing Status", value: <StatusBadge status={project.billing_status} /> },
  ];

  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const computeOnTrack = () => {
    if (!project.start_date || !project.due_date) return null;
    const start = new Date(project.start_date).getTime();
    const end = new Date(project.due_date).getTime();
    const now = Date.now();
    if (now > end) {
      return progress === 100
        ? { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
        : { label: "Overdue", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    const elapsed = (now - start) / (end - start);
    const expected = Math.min(100, Math.max(0, elapsed * 100));
    if (progress >= expected - 10) return { label: "On Track", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return { label: "At Risk", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  };
  const onTrack = computeOnTrack();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/client-delivery">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </Button>
        </Link>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2">
          <Pencil className="w-4 h-4" /> Edit Project
        </Button>
      </div>

      <PageHeader title={project.title} description={`${project.client_name || "—"} • ${project.project_type || "Project"}`} />

      {/* Progress Summary */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={project.stage} />
              {onTrack && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${onTrack.cls}`}>{onTrack.label}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{progress}%</span>
              <span className="text-sm text-muted-foreground ml-1">complete</span>
              {project.start_date && project.due_date && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {fmtDate(project.start_date)} → {fmtDate(project.due_date)}
                </p>
              )}
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {doneCount} of {tasks.length} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* General Section */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="py-6">
          <h3 className="font-bold text-xs uppercase tracking-wide text-muted-foreground mb-4">General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalFields.map((f) => (
              <div key={f.label}>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</p>
                <div className="text-sm font-medium">{f.value}</div>
              </div>
            ))}
          </div>
          {project.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Only Section */}
      {isManager ? (
        <Card className="border-0 shadow-sm border-l-4 border-l-primary">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">Admin / Manager Only</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminFields.map((f) => (
                <div key={f.label}>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</p>
                  <div className="text-sm font-medium">{f.value}</div>
                </div>
              ))}
            </div>
            {project.internal_notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Internal Notes</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{project.internal_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Gantt Schedule */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="py-6">
          <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">Schedule — Gantt</h3>
          <ProjectGantt project={project} tasks={tasks} />
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="py-6">
          <ProjectTasks projectId={id} onTasksChanged={load} />
        </CardContent>
      </Card>

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={project} clients={clients} onSaved={load} />
    </div>
  );
}