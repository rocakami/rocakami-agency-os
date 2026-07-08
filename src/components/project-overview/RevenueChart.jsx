import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

function fmtMoney(v) {
  return `$${Number(v || 0).toLocaleString()}`;
}

export default function RevenueChart({ projects, range, totalRevenue }) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);

  // Group project contract values by month within the range
  const monthMap = {};
  const months = [];
  const cur = new Date(cutoff.getFullYear(), cutoff.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  while (cur <= endMonth) {
    const key = `${cur.getFullYear()}-${cur.getMonth()}`;
    const label = cur.toLocaleDateString(undefined, { month: "short" });
    monthMap[key] = { label, value: 0 };
    months.push(key);
    cur.setMonth(cur.getMonth() + 1);
  }

  projects.forEach((p) => {
    const d = p.start_date ? new Date(p.start_date) : new Date(p.created_date);
    if (d >= cutoff) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[key]) {
        monthMap[key].value += p.contract_value || 0;
      }
    }
  });

  const data = months.map((k) => monthMap[k]);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-sm">Revenue Overview</h3>
          <div className="text-right">
            <p className="text-xl font-bold">{fmtMoney(totalRevenue)}</p>
            <p className="text-[11px] text-muted-foreground">Total contract value</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">Last {range} days by project start date</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [fmtMoney(v), "Revenue"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}