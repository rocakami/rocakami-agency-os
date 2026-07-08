import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getBarColor(pct) {
  if (pct >= 85) return "#E11D48";
  if (pct >= 65) return "#F59E0B";
  return "#10B981";
}

const AVATAR_COLORS = ["#0284C7", "#7C3AED", "#0891B2", "#4F46E5", "#DB2777", "#059669"];

export default function TeamWorkload({ contractors, tasks }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workloads = contractors
    .filter((c) => c.contract_status === "Active")
    .map((c) => {
      const myTasks = tasks.filter((t) => t.assigned_to && t.assigned_to.toLowerCase().includes(c.name.toLowerCase()));
      const open = myTasks.filter((t) => t.status !== "Done").length;
      const done = myTasks.filter((t) => t.status === "Done").length;
      const overdue = myTasks.filter((t) => t.due_date && new Date(t.due_date) < today && t.status !== "Done").length;
      return { ...c, open, done, total: myTasks.length, overdue };
    })
    .filter((w) => w.total > 0);

  const maxOpen = Math.max(...workloads.map((w) => w.open), 1);

  const sorted = workloads.sort((a, b) => b.open - a.open).slice(0, 8);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Team Workload</h3>
          <Link to="/contractors" className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No team workload data yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sorted.map((w, i) => {
              const pct = Math.round((w.open / maxOpen) * 100);
              const barColor = getBarColor(pct);
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Link key={w.id} to={`/contractors/${w.id}`} className="block group">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {getInitials(w.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-sky-600 transition-colors">{w.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{w.role}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {w.open} open • {w.done} done{w.overdue > 0 && <span className="text-rose-500"> • {w.overdue} overdue</span>}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}