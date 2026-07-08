import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("All");

  useEffect(() => {
    base44.entities.Announcement.list("-created_date").then((data) => {
      setAnnouncements(data);
      localStorage.setItem("announcements_last_viewed", new Date().toISOString());
    }).finally(() => setLoading(false));
  }, []);

  const filtered = announcements.filter((a) => catFilter === "All" || a.category === catFilter);
  const pinned = filtered.filter((a) => a.pinned);
  const unpinned = filtered.filter((a) => !a.pinned);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Announcements" description="Company updates, policy changes, and team reminders" />

      <div className="mb-6">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {["All", "Company Update", "Policy Change", "New Client", "Process Update", "Team Reminder"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Post announcements from the Admin panel." />
      ) : (
        <div className="space-y-4">
          {pinned.map((a) => (
            <Card key={a.id} className="border-0 shadow-sm border-l-4 border-l-sky-400">
              <CardContent className="py-5 px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin className="w-3.5 h-3.5 text-sky-500" />
                      <h3 className="font-bold text-base">{a.title}</h3>
                      <StatusBadge status={a.priority} />
                      {a.category && <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a.category}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.content}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(a.created_date).toLocaleDateString()}</span>
                </div>
                {a.author && <p className="text-[11px] text-muted-foreground mt-3">— {a.author}</p>}
              </CardContent>
            </Card>
          ))}
          {unpinned.map((a) => (
            <Card key={a.id} className="border-0 shadow-sm">
              <CardContent className="py-5 px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{a.title}</h3>
                      <StatusBadge status={a.priority} />
                      {a.category && <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a.category}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.content}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(a.created_date).toLocaleDateString()}</span>
                </div>
                {a.author && <p className="text-[11px] text-muted-foreground mt-3">— {a.author}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}