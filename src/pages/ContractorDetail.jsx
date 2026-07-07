import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import {
  Loader2, ArrowLeft, Mail, Phone, MapPin, Calendar,
  DollarSign, Users, FileText, AlertTriangle, FolderOpen
} from "lucide-react";

export default function ContractorDetail() {
  const { id } = useParams();
  const [contractor, setContractor] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const c = await base44.entities.Contractor.get(id);
        setContractor(c);
        const allProjects = await base44.entities.ClientProject.list();
        const matched = allProjects.filter((p) =>
          p.assigned_to && c.name && p.assigned_to.toLowerCase().includes(c.name.toLowerCase())
        );
        setProjects(matched);
      } catch (e) { /* not found */ }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!contractor) {
    return <EmptyState icon={AlertTriangle} title="Contractor not found" description="This record may have been removed." />;
  }

  const details = [
    { icon: Mail, label: "Email", value: contractor.email },
    { icon: Phone, label: "Phone", value: contractor.phone },
    { icon: MapPin, label: "Address", value: contractor.address },
    { icon: AlertTriangle, label: "Emergency Contact", value: contractor.emergency_contact },
    { icon: DollarSign, label: "Rate", value: contractor.rate },
    { icon: Users, label: "Assigned Clients", value: contractor.assigned_clients },
    { icon: Calendar, label: "Start Date", value: contractor.start_date ? new Date(contractor.start_date).toLocaleDateString() : null }
  ].filter((d) => d.value);

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-2 gap-1 text-muted-foreground">
        <Link to="/contractors"><ArrowLeft className="w-4 h-4" /> Back to Contractors</Link>
      </Button>

      <PageHeader title={contractor.name} description={contractor.role || "Contractor"} />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Personal Details */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardContent className="py-6 px-6">
            <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">Personal Details</h3>
            <div className="space-y-4">
              {details.map((d, i) => {
                const Icon = d.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{d.label}</p>
                      <p className="text-sm font-medium">{d.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Payment:</span>
                <StatusBadge status={contractor.payment_status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Contract:</span>
                <StatusBadge status={contractor.contract_status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="py-6 px-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Assigned Projects ({projects.length})
              </h3>
            </div>

            {projects.length === 0 ? (
              <EmptyState icon={FolderOpen} title="No projects assigned" description="This contractor has no active project assignments." />
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/clients/${p.id}`}
                    className="block rounded-lg border p-3 hover:border-sky-300 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.client_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.stage} />
                        <StatusBadge status={p.priority} />
                      </div>
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
                  </Link>
                ))}
              </div>
            )}

            {contractor.performance_notes && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</h4>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contractor.performance_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}