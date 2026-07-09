import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Filter, CheckSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TaskFormDialog from "@/components/my-tasks/TaskFormDialog";
import { useToast } from "@/components/ui/use-toast";

const STATUS_STYLES = {
  "To Do": "bg-gray-100 text-gray-700 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "On Hold": "bg-amber-100 text-amber-700 border-amber-200",
  "Done": "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_STYLES = {
  "Low": "text-gray-500",
  "Medium": "text-amber-600",
  "High": "text-red-600",
};

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function isOverdue(t) {
  if (!t.due_date || t.status === "Done") return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(t.due_date) < today;
}

export default function MyTasks() {
  const [user, setUser] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ client: "all", project: "all", staff: "all", dueDate: "all", status: "all" });
  const { toast } = useToast();

  const load = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const isAdm = me.role === "admin";
      const matches = await base44.entities.Contractor.filter({ email: me.email });
      const cont = matches.length > 0 ? matches[0] : null;
      setContractor(cont);
      const cat = (cont?.employment_category || "").toLowerCase();
      const isMgr = cat.includes("manager") || cat.includes("lead");
      setIsPrivileged(isAdm || isMgr);

      const [allTasks, allProjects, allClients, allContractors] = await Promise.all([
        base44.entities.Task.list("-created_date"),
        base44.entities.ClientProject.list(),
        base44.entities.Client.list(),
        base44.entities.Contractor.list(),
      ]);
      setTasks(allTasks);
      setProjects(allProjects);
      setClients(allClients);
      setContractors(allContractors);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Map project_id -> project
  const projectMap = useMemo(() => {
    const m = {};
    projects.forEach((p) => { m[p.id] = p; });
    return m;
  }, [projects]);

  // Tasks visible to this user
  const visibleTasks = useMemo(() => {
    if (isPrivileged) return tasks;
    return tasks.filter((t) => {
      const assignedToMe = contractor && t.assigned_to === contractor.name;
      const createdByMe = t.created_by_user_id === user?.id;
      return assignedToMe || createdByMe;
    });
  }, [tasks, isPrivileged, contractor, user]);

  // Unique filter options based on visible tasks
  const filterClients = useMemo(() => {
    const set = new Set();
    visibleTasks.forEach((t) => {
      const proj = projectMap[t.project_id];
      if (proj?.client_name) set.add(proj.client_name);
    });
    return Array.from(set).sort();
  }, [visibleTasks, projectMap]);

  const filterProjects = useMemo(() => {
    const set = new Set();
    visibleTasks.forEach((t) => {
      if (t.project_id && projectMap[t.project_id]) set.add(t.project_id);
    });
    return Array.from(set).map((id) => projectMap[id]).filter(Boolean).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [visibleTasks, projectMap]);

  const filterStaff = useMemo(() => {
    const set = new Set();
    visibleTasks.forEach((t) => { if (t.assigned_to) set.add(t.assigned_to); });
    return Array.from(set).sort();
  }, [visibleTasks]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return visibleTasks.filter((t) => {
      const proj = projectMap[t.project_id];
      if (filters.client !== "all") {
        if (!proj || proj.client_name !== filters.client) return false;
      }
      if (filters.project !== "all") {
        if (t.project_id !== filters.project) return false;
      }
      if (filters.staff !== "all") {
        if (t.assigned_to !== filters.staff) return false;
      }
      if (filters.status !== "all") {
        if (t.status !== filters.status) return false;
      }
      if (filters.dueDate !== "all") {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const due = t.due_date ? new Date(t.due_date) : null;
        const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + 7);
        switch (filters.dueDate) {
          case "overdue": if (!due || due >= today || t.status === "Done") return false; break;
          case "today": if (!due || due.toDateString() !== today.toDateString()) return false; break;
          case "week": if (!due || due < today || due > endOfWeek) return false; break;
          case "none": if (due) return false; break;
        }
      }
      return true;
    });
  }, [visibleTasks, filters, projectMap]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const done = filteredTasks.filter((t) => t.status === "Done").length;
    const inProgress = filteredTasks.filter((t) => t.status === "In Progress").length;
    const toDo = filteredTasks.filter((t) => t.status === "To Do").length;
    const onHold = filteredTasks.filter((t) => t.status === "On Hold").length;
    const overdue = filteredTasks.filter(isOverdue).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, toDo, onHold, overdue, pct };
  }, [filteredTasks]);

  const handleDelete = async (id) => {
    try {
      await base44.entities.Task.delete(id);
      load();
      toast({ title: "Task deleted" });
    } catch (e) {
      toast({ title: "Error deleting task", variant: "destructive" });
    }
  };

  const openNew = () => { setEditingTask(null); setDialogOpen(true); };
  const openEdit = (t) => { setEditingTask(t); setDialogOpen(true); };

  const hasFilters = filters.client !== "all" || filters.project !== "all" || filters.staff !== "all" || filters.dueDate !== "all" || filters.status !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Tasks"
        description={isPrivileged ? "All tasks across client delivery and personal tracking" : "Your assigned tasks and personal task tracking"}
      >
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </PageHeader>

      {/* Stats / Progress Bar */}
      <Card className="border-0 shadow-sm mb-5">
        <CardContent className="py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{stats.total} Tasks</span>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {stats.done} Done</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-600" /> {stats.inProgress} In Progress</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-500" /> {stats.toDo} To Do</span>
                {stats.onHold > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> {stats.onHold} On Hold</span>}
                {stats.overdue > 0 && <span className="flex items-center gap-1 text-red-600"><AlertCircle className="w-3.5 h-3.5" /> {stats.overdue} Overdue</span>}
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{stats.pct}%</span>
              <span className="text-sm text-muted-foreground ml-1">complete</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
            {stats.total > 0 && (
              <>
                <div className="h-full bg-green-500 transition-all" style={{ width: `${(stats.done / stats.total) * 100}%` }} />
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} />
                <div className="h-full bg-amber-400 transition-all" style={{ width: `${(stats.onHold / stats.total) * 100}%` }} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-5">
        <CardContent className="py-4 px-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</span>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto" onClick={() => setFilters({ client: "all", project: "all", staff: "all", dueDate: "all", status: "all" })}>
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Select value={filters.client} onValueChange={(v) => setFilters({ ...filters, client: v })}>
              <SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {filterClients.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.project} onValueChange={(v) => setFilters({ ...filters, project: v })}>
              <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {filterProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.staff} onValueChange={(v) => setFilters({ ...filters, staff: v })}>
              <SelectTrigger><SelectValue placeholder="Staff" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {filterStaff.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.dueDate} onValueChange={(v) => setFilters({ ...filters, dueDate: v })}>
              <SelectTrigger><SelectValue placeholder="Due Date" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="week">Due This Week</SelectItem>
                <SelectItem value="none">No Due Date</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {["To Do", "In Progress", "On Hold", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No tasks found</p>
              <p className="text-xs text-muted-foreground mt-1">{hasFilters ? "Try adjusting your filters." : "Click 'Add Task' to create one."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground px-4 py-3">Task Description</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground px-4 py-3">Project</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground px-4 py-3 hidden md:table-cell">Assigned To</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground px-4 py-3 hidden sm:table-cell">Start Date</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground px-4 py-3">Due Date</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground px-4 py-3 hidden lg:table-cell">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTasks.map((t) => {
                    const proj = projectMap[t.project_id];
                    const overdue = isOverdue(t);
                    return (
                      <tr key={t.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <p className={`font-medium ${t.status === "Done" ? "line-through text-muted-foreground/60" : ""}`}>{t.title}</p>
                          {t.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            {t.priority && <span className={`text-[10px] font-medium ${PRIORITY_STYLES[t.priority] || ""}`}>{t.priority}</span>}
                            {t.is_personal && <span className="text-[10px] bg-purple-100 text-purple-700 rounded-full px-1.5 py-0.5">Personal</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {proj ? (
                            <Link to={`/projects/${proj.id}`} className="text-sky-600 hover:underline flex items-center gap-1 text-xs font-medium">
                              {proj.title} <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {t.assigned_to ? (
                            <span className="text-xs bg-muted rounded-full px-2 py-0.5">{t.assigned_to}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{fmtDate(t.start_date)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                            {fmtDate(t.due_date)}
                            {overdue && " ⚠"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[t.status] || STATUS_STYLES["To Do"]}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(t)} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingTask}
        projects={projects}
        contractors={contractors}
        currentUser={user}
        isPrivileged={isPrivileged}
        onSaved={load}
      />
    </div>
  );
}