import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Fetches all announcements and filters them based on the current user's
 * visibility permissions (Everyone / Specific Staff / Managers & Leads).
 * Subscribes to real-time changes.
 */
export function useVisibleAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  const contractorRef = useRef(null);

  const filterAnnouncements = (all) => {
    const me = userRef.current;
    if (!me) return [];
    const contractor = contractorRef.current;
    const isManagerOrLead =
      me.role === "admin" ||
      contractor?.employment_category === "Manager" ||
      contractor?.employment_category === "Lead";

    return all.filter((a) => {
      if (!a.visibility || a.visibility === "Everyone") return true;
      if (a.visibility === "Specific Staff") {
        const ids = (a.target_user_ids || "").split(",").map((s) => s.trim()).filter(Boolean);
        return ids.includes(me.id) || (contractor && ids.includes(contractor.id));
      }
      if (a.visibility === "Managers & Leads") return isManagerOrLead;
      return true;
    });
  };

  const fetchVisible = async () => {
    const all = await base44.entities.Announcement.list("-created_date", 50);
    return filterAnnouncements(all);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        userRef.current = me;
        try {
          let matches = await base44.entities.Contractor.filter({ email: me.email });
          if (matches.length === 0 && me.full_name) {
            matches = await base44.entities.Contractor.filter({ name: me.full_name });
          }
          if (matches.length > 0) contractorRef.current = matches[0];
        } catch (_e) { /* ignore */ }
        const visible = await fetchVisible();
        setAnnouncements(visible);
      } catch (_e) {
        setAnnouncements([]);
      }
      setLoading(false);
    };
    load();

    const unsubscribe = base44.entities.Announcement.subscribe(() => {
      fetchVisible().then(setAnnouncements).catch(() => {});
    });
    return unsubscribe;
  }, []);

  return { announcements, loading };
}

export function getUnreadCount(announcements) {
  try {
    const seen = JSON.parse(localStorage.getItem("announcements_seen_ids") || "[]");
    const seenSet = new Set(seen);
    return announcements.filter((a) => !seenSet.has(a.id)).length;
  } catch {
    return announcements.length;
  }
}

export function markAnnouncementsSeen(announcements) {
  try {
    const ids = announcements.map((a) => a.id);
    localStorage.setItem("announcements_seen_ids", JSON.stringify(ids));
  } catch { /* ignore */ }
}