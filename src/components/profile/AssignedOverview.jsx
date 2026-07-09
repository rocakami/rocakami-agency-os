import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, ExternalLink, FolderOpen } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

export default function AssignedOverview({ contractorName, contractorEmail }) {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [allClients, allProjects] = await Promise.all([
          base44.entities.Client.list("-created_date"),
          base44.entities.ClientProject.list("-created_date"),
        ]);

        // Match clients whose name/company appears in this contractor's assigned_clients field
        // or where the client was found via the contractor's assigned list
        const name = (contractorName || "").toLowerCase();
        const assignedClients = allClients.filter((c) => {
          // We don't have direct access to the contractor's assigned_clients string here,
          // but the parent passes contractorName — we match projects assigned to this person
          return false; // placeholder, clients come from project assignments
        });

        // Find projects assigned to this contractor by name
        const myProjects = allProjects.filter((p) => {
          const assigned = (p.assigned_to || "").toLowerCase();
          return assigned.includes(name);
        });

        setProjects(myProjects);

        // Derive clients from the projects
        const clientNames = new Set(
          myProjects.map((p) => p.client_name).filter(Boolean)
        );
        const myClients = allClients.filter((c) => {
          const company = (c.company_name || "").toLowerCase();
          const cname = (c.name || "").toLowerCase();
          return [...clientNames].some(
            (cn) => cn.toLowerCase() === company || cn.toLowerCase() === cname
          );
        });
        setClients(myClients);
      } catch (_e) {
        /* ignore */
      }
      setLoading(false);
    };
    if (contractorName) load();
    else setLoading(false);
  }, [contractorName]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5 mt-5">
      {/* Assigned Clients */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-navy-600" />
            </div>
            <h3 className="font-semibold text-sm">Assigned Clients</h3>
          </div>
          {clients.length === 0 ? (
            <EmptyState icon={Users} title="No clients assigned" description="Clients from your projects will appear here." />
          ) : (
            <div className="space-y-2">
              {clients.map((c) => (
                <Link key={c.id} to={`/clients/${c.id}`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.company_name || c.name}</p>
                    {c.industry && <p className="text-[11px] text-muted-foreground">{c.industry}</p>}
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Projects */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-navy-600" />
            </div>
            <h3 className="font-semibold text-sm">Assigned Projects</h3>
          </div>
          {projects.length === 0 ? (
            <EmptyState icon={Briefcase} title="No projects assigned" description="Projects assigned to you will appear here." />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    {p.client_name && <p className="text-[11px] text-muted-foreground truncate">{p.client_name}</p>}
                  </div>
                  <StatusBadge status={p.stage} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}