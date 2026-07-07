import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectFormDialog from "@/components/client-delivery/ProjectFormDialog";

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

  const load = () => base44.entities.ClientProject.get(id).then(setProject).finally(() => setLoading(false));

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
    { label: "Client", value: project.client_name || "—" },
    { label: "Stage", value: <StatusBadge status={project.stage} /> },
    { label: "Project Type", value: project.project_type || "—" },
    { label: "Priority", value: <StatusBadge status={project.priority} /> },
    { label: "Assigned To", value: project.assigned_to || "—" },
    { label: "Start Date", value: fmtDate(project.start_date) },
    { label: "Due Date", value: fmtDate(project.due_date) },
  ];

  const adminFields = [
    { label: "Contract Value", value: fmtMoney(project.contract_value) },
    { label: "Budget", value: fmtMoney(project.budget) },
    { label: "Billing Status", value: <StatusBadge status={project.billing_status} /> },
  ];

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
          {project.progress != null && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Progress</p>
                <span className="text-xs font-semibold">{project.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          )}
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

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={project} clients={clients} onSaved={load} />
    </div>
  );
}