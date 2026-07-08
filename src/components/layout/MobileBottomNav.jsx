import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { navItems } from "@/lib/nav-items";
import { getNavIcon } from "@/lib/nav-icons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LayoutDashboard, MoreHorizontal, UserCircle, Shield, Grid3x3 } from "lucide-react";

// Items pinned to the bottom bar (always visible)
const PRIMARY_PATHS = ["/", "/sops", "/client-delivery", "/announcements"];

export default function MobileBottomNav() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [allowedPaths, setAllowedPaths] = useState(null);
  const [navSections, setNavSections] = useState([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role === "admin") {
          setAllowedPaths(null);
        } else {
          const perms = await base44.entities.NavPermission.filter({ user_id: me.id });
          if (perms.length > 0 && perms[0].allowed_paths) {
            setAllowedPaths(new Set(perms[0].allowed_paths.split(",").filter(Boolean)));
          } else {
            setAllowedPaths(null);
          }
        }
        const secs = await base44.entities.NavSection.list("order");
        setNavSections(secs);

        const lastViewed = localStorage.getItem("announcements_last_viewed");
        const announcements = await base44.entities.Announcement.list("-created_date", 50);
        const count = lastViewed
          ? announcements.filter((a) => new Date(a.created_date) > new Date(lastViewed)).length
          : announcements.length;
        setUnread(count);
      } catch (e) { /* default to all access */ }
    };
    load();
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const sourceItems = navSections.length > 0
    ? navSections.map((s) => ({ ...s, icon: getNavIcon(s.icon) }))
    : navItems;

  const visibleItems = sourceItems.filter((item) => {
    if (item.path === "/") return true;
    if (item.path === "/contractors") return true;
    if (!allowedPaths) return true;
    return allowedPaths.has(item.path);
  });

  const primaryItems = PRIMARY_PATHS
    .map((p) => visibleItems.find((i) => i.path === p))
    .filter(Boolean);

  const moreItems = visibleItems.filter((i) => !PRIMARY_PATHS.includes(i.path));

  const handleNavClick = (path) => {
    if (path === "/announcements") {
      localStorage.setItem("announcements_last_viewed", new Date().toISOString());
      setUnread(0);
    }
    setMoreOpen(false);
  };

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => handleNavClick(item.path)}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5 relative"
      >
        <div className="relative">
          <Icon className={`w-[20px] h-[20px] shrink-0 ${active ? "text-sky-400" : "text-white/60"}`} />
          {item.path === "/announcements" && unread > 0 && (
            <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 text-[9px] font-bold rounded-full bg-red-500 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <span className={`text-[9px] font-medium truncate max-w-full ${active ? "text-white" : "text-white/60"}`}>
          {item.label === "SOP Library" ? "SOPs" : item.label === "Client Delivery" ? "Delivery" : item.label === "Announcements" ? "Alerts" : item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1a3676] border-t border-white/10 flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {primaryItems.map(renderItem)}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5"
        >
          <Grid3x3 className={`w-[20px] h-[20px] shrink-0 ${moreOpen ? "text-sky-400" : "text-white/60"}`} />
          <span className="text-[9px] font-medium text-white/60">More</span>
        </button>

        {/* Profile */}
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5"
        >
          <UserCircle className={`w-[20px] h-[20px] shrink-0 ${isActive("/profile") ? "text-sky-400" : "text-white/60"}`} />
          <span className={`text-[9px] font-medium ${isActive("/profile") ? "text-white" : "text-white/60"}`}>Account</span>
        </Link>
      </div>

      {/* More sheet — full nav grid */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-3">
          <div className="mx-auto w-10 h-1 rounded-full bg-muted mb-4" />
          <div className="grid grid-cols-4 gap-3">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-[#1a3676] text-white" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive("/admin") ? "bg-[#1a3676] text-white" : "bg-muted text-muted-foreground"}`}>
                  <Shield className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[10px] font-medium text-center leading-tight">Admin</span>
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}