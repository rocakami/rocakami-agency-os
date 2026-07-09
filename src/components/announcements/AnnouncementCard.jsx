import React, { useState } from "react";
import { Pin, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";

export default function AnnouncementCard({ announcement, pinned }) {
  const [expanded, setExpanded] = useState(false);
  const a = announcement;
  const isLong = a.content && a.content.length > 150;

  return (
    <Card className={`border-0 shadow-sm ${pinned ? "border-l-4 border-l-sky-400" : ""}`}>
      <CardContent className="py-5 px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {pinned && <Pin className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
              <h3 className={`${pinned ? "font-bold text-base" : "font-semibold"}`}>{a.title}</h3>
              <StatusBadge status={a.priority} />
              {a.category && <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a.category}</span>}
            </div>
            <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${!expanded && isLong ? "line-clamp-3" : ""}`}>{a.content}</p>
            {isLong && (
              <button onClick={() => setExpanded(!expanded)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline">
                {expanded ? (<><ChevronUp className="w-3 h-3" /> Show less</>) : (<><ChevronDown className="w-3 h-3" /> Read more</>)}
              </button>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{new Date(a.created_date).toLocaleDateString()}</span>
        </div>
        {a.author && <p className="text-[11px] text-muted-foreground mt-3">— {a.author}</p>}
      </CardContent>
    </Card>
  );
}