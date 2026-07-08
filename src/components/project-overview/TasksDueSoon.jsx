import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Circle } from "lucide-react";

function fmtDue(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TasksDueSoon({ tasks, projects }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = tasks
    .filter((t) => t.status !== "Done" && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 7);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Tasks Due Soon</h3>
          <Link to="/client-delivery" className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No upcoming tasks</div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((t) => {
              const project = projects.find((p) => p.id === t.project_id);
              const overdue = new Date(t.due_date) < today;
              return (
                <Link key={t.id} to={project ? `/projects/${project.id}` : "/client-delivery"} className="flex items-center gap-3 group">
                  <Circle className={`w-4 h-4 shrink-0 ${overdue ? "text-rose-400" : "text-muted-foreground/40"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-sky-600 transition-colors">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{project?.client_name || "Unassigned"}</p>
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