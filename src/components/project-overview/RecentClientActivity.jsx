import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, UserPlus } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w ago";
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function RecentClientActivity({ clients, projects }) {
  // Build activity feed from recent clients and projects
  const activities = [
    ...clients.slice(0, 10).map((c) => ({
      id: `client-${c.id}`,
      icon: c.status === "Prospect" ? UserPlus : Building2,
      color: c.status === "Prospect" ? "text-purple-600 bg-purple-50" : "text-blue-600 bg-blue-50",
      text: <><span className="font-medium">{c.company_name}</span> {c.status === "Prospect" ? "added as a new lead" : `status: ${c.status}`}</>,
      time: c.created_date,
    })),
    ...projects.slice(0, 10).map((p) => ({
      id: `project-${p.id}`,
      icon: Briefcase,
      color: "text-sky-600 bg-sky-50",
      text: <>Project <span className="font-medium">{p.title}</span> moved to {p.stage}</>,
      time: p.created_date,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-bold text-sm mb-4">Recent Client Activity</h3>
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-foreground leading-snug">{a.text}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">{timeAgo(a.time)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}