import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, ArrowRight } from "lucide-react";

function fmtDue(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function daysUntil(d) {
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / 86400000);
}

export default function UpcomingDeadlines({ projects, tasks }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = projects
    .filter((p) => p.due_date && p.stage !== "Closure")
    .map((p) => {
      const ptasks = tasks.filter((t) => t.project_id === p.id);
      const done = ptasks.filter((t) => t.status === "Done").length;
      const progress = ptasks.length > 0 ? Math.round((done / ptasks.length) * 100) : 0;
      return { ...p, daysLeft: daysUntil(p.due_date), progress };
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 6);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-muted-foreground" /> Upcoming Deadlines
          </h3>
          <Link to="/client-delivery" className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No upcoming deadlines</div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((p) => {
              const overdue = p.daysLeft < 0;
              const urgent = p.daysLeft >= 0 && p.daysLeft <= 7;
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-3 group">
                  <div className={`w-1 h-9 rounded-full shrink-0 ${overdue ? "bg-rose-500" : urgent ? "bg-amber-500" : "bg-sky-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-sky-600 transition-colors">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{p.client_name} • {p.progress}% done</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold ${overdue ? "text-rose-600" : urgent ? "text-amber-600" : "text-muted-foreground"}`}>
                      {fmtDue(p.due_date)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {overdue ? `${Math.abs(p.daysLeft)}d overdue` : p.daysLeft === 0 ? "Today" : `${p.daysLeft}d left`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}