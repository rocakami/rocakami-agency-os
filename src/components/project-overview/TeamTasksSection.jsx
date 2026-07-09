import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Circle, CheckCircle2 } from "lucide-react";

function fmtDue(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TeamTasksSection({ tasks, projects, clients, contractors }) {
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("all");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const projectMap = useMemo(() => {
    const m = {};
    projects.forEach((p) => { m[p.id] = p; });
    return m;
  }, [projects]);

  const clientOptions = useMemo(() => {
    const names = [...new Set(projects.map((p) => p.client_name).filter(Boolean))];
    return names.sort();
  }, [projects]);

  const staffOptions = useMemo(() => {
    const names = [...new Set(tasks.flatMap((t) => (t.assigned_to || "").split(",").map((n) => n.trim()).filter(Boolean)))];
    return names.sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterValue === "all") return true;
      const project = projectMap[t.project_id];
      if (filterType === "delivery") {
        return project?.id === filterValue;
      }
      if (filterType === "client") {
        return project?.client_name === filterValue;
      }
      if (filterType === "staff") {
        return (t.assigned_to || "").toLowerCase().includes(filterValue.toLowerCase());
      }
      return true;
    });
  }, [tasks, filterType, filterValue, projectMap]);

  const completion = useMemo(() => {
    const total = filteredTasks.length;
    const done = filteredTasks.filter((t) => t.status === "Done").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, open: total - done, pct };
  }, [filteredTasks]);

  const upcoming = useMemo(() => {
    return filteredTasks
      .filter((t) => t.status !== "Done" && t.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 10);
  }, [filteredTasks]);

  const handleFilterTypeChange = (v) => {
    setFilterType(v);
    setFilterValue("all");
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-sm">Team Tasks & Completion</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterType} onValueChange={handleFilterTypeChange}>
              <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="delivery">Client Delivery</SelectItem>
                <SelectItem value="client">Client Directory</SelectItem>
                <SelectItem value="staff">Staff Name</SelectItem>
              </SelectContent>
            </Select>
            {filterType !== "all" && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filterType === "delivery" ? "Projects" : filterType === "client" ? "Clients" : "Staff"}</SelectItem>
                  {filterType === "delivery" && projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                  {filterType === "client" && clientOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  {filterType === "staff" && staffOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Completion Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total Tasks</p>
            <p className="text-xl font-bold">{completion.total}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-[11px] text-emerald-700 uppercase tracking-wide">Completed</p>
            <p className="text-xl font-bold text-emerald-700">{completion.done}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-[11px] text-amber-700 uppercase tracking-wide">Open</p>
            <p className="text-xl font-bold text-amber-700">{completion.open}</p>
          </div>
          <div className="rounded-lg bg-sky-50 p-3">
            <p className="text-[11px] text-sky-700 uppercase tracking-wide">Team Completion</p>
            <p className="text-xl font-bold text-sky-700">{completion.pct}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-5">
          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${completion.pct}%` }} />
        </div>

        {/* Tasks Due Soon */}
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Tasks Due Soon</h4>
        </div>
        {upcoming.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No upcoming tasks</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((t) => {
              const project = projectMap[t.project_id];
              const overdue = new Date(t.due_date) < today;
              return (
                <Link key={t.id} to={project ? `/projects/${project.id}` : "/client-delivery"} className="flex items-center gap-3 group">
                  <Circle className={`w-4 h-4 shrink-0 ${overdue ? "text-rose-400" : "text-muted-foreground/40"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-sky-600 transition-colors">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {project?.client_name || "Unassigned"}{t.assigned_to ? ` • ${t.assigned_to}` : ""}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium shrink-0 ${overdue ? "text-rose-600" : "text-muted-foreground"}`}>
                    {fmtDue(t.due_date)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}