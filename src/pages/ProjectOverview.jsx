import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FolderOpen, FileText, AlertTriangle, UserPlus, ArrowRight } from "lucide-react";
import SalesPipeline from "@/components/project-overview/SalesPipeline";
import ProjectOverviewList from "@/components/project-overview/ProjectOverviewList";
import TasksDueSoon from "@/components/project-overview/TasksDueSoon";
import RevenueChart from "@/components/project-overview/RevenueChart";
import RecentClientActivity from "@/components/project-overview/RecentClientActivity";

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function fmtMoney(v) {
  return v != null ? `$${Number(v).toLocaleString()}` : "$0";
}

export default function ProjectOverview() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [range, setRange] = useState(30);

  useEffect(() => {
    const load = async () => {
      try {
        const [projList, clientList, taskList] = await Promise.all([
          base44.entities.ClientProject.list("-created_date", 200),
          base44.entities.Client.list("-created_date", 200),
          base44.entities.Task.list("-due_date", 200),
        ]);
        setProjects(projList);
        setClients(clientList);
        setTasks(taskList);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  // KPI calculations
  const totalRevenue = projects.reduce((sum, p) => sum + (p.contract_value || 0), 0);
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const openProjects = projects.filter((p) => p.stage !== "Closure").length;
  const pendingInvoiceProjects = projects.filter((p) => p.billing_status === "Partially Billed" || p.billing_status === "Overdue");
  const pendingInvoiceTotal = pendingInvoiceProjects.reduce((sum, p) => sum + (p.contract_value || 0), 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < today && t.status !== "Done");
  const leadsInPipeline = clients.filter((c) => c.status === "Prospect").length;

  const kpis = [
    { label: "Total Revenue", value: fmtMoney(totalRevenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-50", sub: `${projects.length} projects` },
    { label: "Active Clients", value: activeClients, icon: Users, color: "text-blue-600 bg-blue-50", sub: `${clients.length} total` },
    { label: "Open Projects", value: openProjects, icon: FolderOpen, color: "text-sky-600 bg-sky-50", sub: `${projects.length - openProjects} closed` },
    { label: "Pending Invoices", value: pendingInvoiceProjects.length, icon: FileText, color: "text-amber-600 bg-amber-50", sub: fmtMoney(pendingInvoiceTotal) },
    { label: "Overdue Tasks", value: overdueTasks.length, icon: AlertTriangle, color: "text-rose-600 bg-rose-50", sub: `${tasks.filter((t) => t.status !== "Done").length} total open` },
    { label: "Leads in Pipeline", value: leadsInPipeline, icon: UserPlus, color: "text-purple-600 bg-purple-50", sub: `${clients.length} total clients` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening across your projects and clients.</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === r.days ? "bg-[#1a3676] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground leading-tight">{kpi.value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Middle Row: Sales Pipeline + Project List + Tasks Due */}
      <div className="grid lg:grid-cols-3 gap-6">
        <SalesPipeline projects={projects} clients={clients} />
        <ProjectOverviewList projects={projects} tasks={tasks} />
        <TasksDueSoon tasks={tasks} projects={projects} />
      </div>

      {/* Bottom Row: Recent Activity + Revenue Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentClientActivity clients={clients} projects={projects} />
        <RevenueChart projects={projects} range={range} totalRevenue={totalRevenue} />
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/client-delivery">
          <Button variant="outline" size="sm" className="gap-2">Client Delivery <ArrowRight className="w-3.5 h-3.5" /></Button>
        </Link>
        <Link to="/clients">
          <Button variant="outline" size="sm" className="gap-2">Client Directory <ArrowRight className="w-3.5 h-3.5" /></Button>
        </Link>
      </div>
    </div>
  );
}