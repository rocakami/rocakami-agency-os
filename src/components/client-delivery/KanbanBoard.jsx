import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StatusBadge from "@/components/shared/StatusBadge";

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
  const [loading, setLoading] = useState(true);

  const load = () => base44.entities.ClientProject.list().then(setProjects).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

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

  const grouped = {};
  STAGES.forEach((s) => (grouped[s] = []));
  projects.forEach((p) => {
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
                            <h4 className="font-semibold text-sm leading-snug">{p.title}</h4>
                            <StatusBadge status={p.priority} />
                          </div>
                          <p className="text-xs text-sky-600 font-medium mb-2">{p.client_name}</p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
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
  );
}