import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

function computeProgress(tasks, projectId) {
  const ptasks = tasks.filter((t) => t.project_id === projectId);
  if (ptasks.length === 0) return { progress: 0, done: 0, total: 0 };
  const done = ptasks.filter((t) => t.status === "Done").length;
  return { progress: Math.round((done / ptasks.length) * 100), done, total: ptasks.length };
}

function computeStatus(project, progress) {
  if (!project.start_date || !project.due_date) return { label: "On Track", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
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
}

export default function ProjectOverviewList({ projects, tasks }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...projects].sort((a, b) => {
    const pa = computeProgress(tasks, a.id).progress;
    const pb = computeProgress(tasks, b.id).progress;
    return pb - pa;
  });
  const display = showAll ? sorted : sorted.slice(0, 5);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Project Overview</h3>
          <Link to="/client-delivery" className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {display.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No projects yet</div>
        ) : (
          <div className="space-y-3">
            {display.map((p) => {
              const { progress, done, total } = computeProgress(tasks, p.id);
              const status = computeStatus(p, progress);
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="block group">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-sky-600 transition-colors">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.client_name} • {p.project_type || "Project"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                      <span className="text-xs font-bold w-9 text-right">{progress}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: status.label === "Overdue" ? "#EF4444" : status.label === "At Risk" ? "#F59E0B" : "#3B82F6",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{done} of {total} tasks done</p>
                </Link>
              );
            })}
            {!showAll && sorted.length > 5 && (
              <button onClick={() => setShowAll(true)} className="w-full text-center text-xs text-sky-600 hover:text-sky-700 font-medium pt-1">
                Show all {sorted.length} projects
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}