import React from "react";

const STATUS_COLORS = {
  "To Do": "bg-gray-300",
  "In Progress": "bg-blue-500",
  "On Hold": "bg-amber-400",
  "Done": "bg-emerald-500",
};

function fmtShort(d) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ProjectGantt({ project, tasks }) {
  if (!project.start_date || !project.due_date) {
    return (
      <div className="rounded-lg bg-muted/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">Set project start and due dates to view the Gantt schedule.</p>
      </div>
    );
  }

  const projStart = new Date(project.start_date).getTime();
  const projEnd = new Date(project.due_date).getTime();
  const span = projEnd - projStart || 1;

  const ganttTasks = tasks.filter((t) => t.due_date || t.start_date);

  if (ganttTasks.length === 0) {
    return (
      <div className="rounded-lg bg-muted/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">No scheduled tasks yet. Add tasks with dates to see the schedule.</p>
      </div>
    );
  }

  const now = Date.now();
  const todayPct = ((now - projStart) / span) * 100;
  const showTodayLine = todayPct >= 0 && todayPct <= 100;

  // Generate month columns
  const months = [];
  const cur = new Date(projStart);
  cur.setDate(1);
  while (cur.getTime() <= projEnd) {
    const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1).getTime();
    const nextMonthStart = new Date(cur.getFullYear(), cur.getMonth() + 1, 1).getTime();
    const left = Math.max(0, ((monthStart - projStart) / span) * 100);
    const right = Math.min(100, ((nextMonthStart - projStart) / span) * 100);
    months.push({
      label: cur.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      left,
      width: Math.max(0.5, right - left),
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Month header */}
        <div className="flex items-center border-b pb-2 mb-3">
          <div className="w-44 shrink-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Task</div>
          <div className="flex-1 relative h-5 ml-2">
            {months.map((m, i) => (
              <div key={i} className="absolute top-0 text-[11px] font-medium text-muted-foreground" style={{ left: `${m.left}%` }}>
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Task rows */}
        <div className="space-y-2.5">
          {ganttTasks.map((t) => {
            const taskStart = t.start_date ? new Date(t.start_date).getTime() : projStart;
            const taskEnd = t.due_date ? new Date(t.due_date).getTime() : (t.start_date ? new Date(t.start_date).getTime() : projEnd);
            const left = Math.max(0, ((taskStart - projStart) / span) * 100);
            const rawWidth = ((taskEnd - taskStart) / span) * 100;
            const width = Math.min(100 - left, Math.max(3, rawWidth));
            const color = STATUS_COLORS[t.status] || STATUS_COLORS["To Do"];
            return (
              <div key={t.id} className="flex items-center">
                <div className="w-44 shrink-0 pr-3">
                  <p className={`text-sm font-medium truncate ${t.status === "Done" ? "line-through text-muted-foreground/60" : ""}`}>{t.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.assigned_to || "Unassigned"}</p>
                </div>
                <div className="flex-1 relative h-7 ml-2">
                  {months.map((m, i) => (
                    <div key={i} className="absolute top-0 bottom-0 border-l border-muted/30" style={{ left: `${m.left}%` }} />
                  ))}
                  {showTodayLine && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10" style={{ left: `${todayPct}%` }} />
                  )}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-5 rounded ${color} flex items-center justify-center text-[10px] text-white font-medium overflow-hidden`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {width > 18 && <span className="px-1 truncate">{fmtShort(taskStart)} – {fmtShort(taskEnd)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-4 mt-4 pt-3 border-t">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Legend</span>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /><span className="text-xs text-muted-foreground">To Do</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-muted-foreground">In Progress</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-xs text-muted-foreground">On Hold</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">Done</span></div>
          {showTodayLine && <div className="flex items-center gap-1.5"><span className="w-0.5 h-3 bg-red-400" /><span className="text-xs text-muted-foreground">Today</span></div>}
        </div>
      </div>
    </div>
  );
}