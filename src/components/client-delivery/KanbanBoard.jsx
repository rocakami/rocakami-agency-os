import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectFormDialog from "@/components/client-delivery/ProjectFormDialog";
import { useToast } from "@/components/ui/use-toast";

const STAGES = ["Intake", "Discovery", "Proposal", "Onboarding", "Active", "Closure"];

const STAGE_COLORS = {
  Intake: "bg-navy-600",
  Discovery: "bg-sky-400",
  Proposal: "bg-indigo-500",
  Onboarding: "bg-emerald-500",
  Active: "bg-amber-500",
  Closure: "bg-teal-500",
};

export default function KanbanBoard() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = () => base44.entities.ClientProject.list().then(setProjects).finally(() => setLoading(false));
  useEffect(() => {
    load();
    base44.entities.Client.list().then(setClients).catch(() => {});
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const sourceStage = STAGES[parseInt(result.source.droppableId)];
    const destStage = STAGES[parseInt(result.destination.droppableId)];
    if (sourceStage === destStage) return;

    const projectId = result.draggableId;
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, stage: destStage } : p)));
    try {
      await base44.entities.ClientProject.update(projectId, { stage: destStage });
    } catch (e) {
      load();
    }
  };

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (e, project) => { e.stopPropagation(); setEditing(project); setDialogOpen(true); };

  const remove = async (e, project) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    try {
      await base44.entities.ClientProject.delete(project.id);
      toast({ title: "Project deleted" });
      load();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const filtered = projects.filter((p) =>
    !search ||
    (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.project_id || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {};
  STAGES.forEach((s) => (grouped[s] = []));
  filtered.forEach((p) => {
    if (grouped[p.stage]) grouped[p.stage].push(p);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Project</Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {STAGES.map((stage, stageIdx) => (
            <Droppable droppableId={stageIdx.toString()} key={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-72 rounded-xl bg-muted/40 p-3 transition-colors ${snapshot.isDraggingOver ? "bg-sky-50 ring-2 ring-sky-200" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[stage]}`} />
                    <h3 className="font-semibold text-sm">{stage}</h3>
                    <span className="text-xs text-muted-foreground ml-auto bg-white px-2 py-0.5 rounded-full">
                      {grouped[stage].length}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {grouped[stage].map((p, index) => (
                      <Draggable draggableId={p.id} index={index} key={p.id}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-white rounded-lg shadow-sm border border-border p-3 cursor-grab active:cursor-grabbing ${snap.isDragging ? "shadow-lg ring-2 ring-sky-400 rotate-1" : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <Link to={`/projects/${p.id}`} className="font-semibold text-sm leading-snug hover:text-primary">
                                {p.title}
                              </Link>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={(e) => openEdit(e, p)} className="p-0.5 text-muted-foreground hover:text-primary transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={(e) => remove(e, p)} className="p-0.5 text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {p.project_id && <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{p.project_id}</span>}
                              <StatusBadge status={p.priority} />
                            </div>
                            <p className="text-xs text-sky-600 font-medium mb-2">{p.client_name}</p>
                            {p.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                            )}
                            {p.progress != null && p.progress > 0 && (
                              <div className="mb-2">
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${p.progress}%` }} />
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>{p.assigned_to || "Unassigned"}</span>
                              {p.due_date && <span>{new Date(p.due_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} clients={clients} onSaved={load} />
    </div>
  );
}