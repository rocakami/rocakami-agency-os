import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const STAGES = [
  { key: "Intake", label: "New Lead", color: "#3B82F6" },
  { key: "Discovery", label: "Discovery Call", color: "#8B5CF6" },
  { key: "Proposal", label: "Proposal Sent", color: "#F97316" },
  { key: "Onboarding", label: "Negotiation", color: "#EAB308" },
  { key: "Active", label: "Won", color: "#10B981" },
  { key: "Closure", label: "Closed", color: "#EF4444" },
];

export default function SalesPipeline({ projects }) {
  const data = STAGES.map((s) => {
    const count = projects.filter((p) => p.stage === s.key).length;
    return { ...s, count };
  }).filter((d) => d.count > 0);

  const total = projects.length;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-bold text-sm mb-4">Sales Pipeline</h3>
        {total === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No projects yet</div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{total}</span>
                <span className="text-[11px] text-muted-foreground">Total Projects</span>
              </div>
            </div>
            <div className="w-full mt-4 space-y-1.5">
              {data.map((d) => {
                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                return (
                  <div key={d.key} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="flex-1 text-muted-foreground">{d.label}</span>
                    <span className="font-medium">{d.count}</span>
                    <span className="text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}