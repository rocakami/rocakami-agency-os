import React from "react";
import { Badge } from "@/components/ui/badge";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-amber-50 text-amber-700 border-amber-200",
  "Needs Review": "bg-rose-50 text-rose-700 border-rose-200",
  Archived: "bg-gray-100 text-gray-600 border-gray-200",
  "To Do": "bg-sky-50 text-sky-700 border-sky-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Overdue: "bg-rose-50 text-rose-700 border-rose-200",
  Expired: "bg-gray-100 text-gray-600 border-gray-200",
  "On Hold": "bg-orange-50 text-orange-700 border-orange-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const style = statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <Badge variant="outline" className={`${style} text-[11px] font-semibold px-2 py-0.5 border`}>
      {status}
    </Badge>
  );
}