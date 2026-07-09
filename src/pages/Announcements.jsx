import React, { useState, useEffect } from "react";
import { Megaphone, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { useVisibleAnnouncements, markAnnouncementsSeen } from "@/hooks/useVisibleAnnouncements";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";

export default function Announcements() {
  const { announcements, loading } = useVisibleAnnouncements();
  const [catFilter, setCatFilter] = useState("All");

  useEffect(() => {
    if (!loading) {
      markAnnouncementsSeen(announcements);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <AnnouncementCard key={a.id} announcement={a} pinned />
          ))}
          {unpinned.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}