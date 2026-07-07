import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, X, Shield, Globe, Briefcase, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { navItems } from "@/lib/nav-items";
import { getNavIcon as getIcon } from "@/lib/nav-icons";

const LOGO_URL = "https://media.base44.com/images/public/6a4d446aeae59d6815f530f1/2ba9e7065_image.png";

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [allowedPaths, setAllowedPaths] = useState(null); // null = all allowed
  const [permsLoaded, setPermsLoaded] = useState(false);
  const [navSections, setNavSections] = useState([]);

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
      } catch (e) { /* default to all access on error */ }
      setPermsLoaded(true);
    };
    load();
  }, []);

  // Auto-refresh when nav sections change in the database
  useEffect(() => {
    const unsubscribe = base44.entities.NavSection.subscribe(() => {
      base44.entities.NavSection.list("order").then(setNavSections).catch(() => {});
    });
    return unsubscribe;
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Use DB sections if available, otherwise fall back to hardcoded navItems
  const sourceItems = navSections.length > 0
    ? navSections.map((s) => ({ ...s, icon: getIcon(s.icon) }))
    : navItems;

  const visibleItems = sourceItems.filter((item) => {
    if (item.path === "/") return true; // Dashboard always visible
    if (!allowedPaths) return true; // null = full access
    return allowedPaths.has(item.path);
  });

  // Build grouped nav: by category_name, preserving DB order
  const navGroups = (() => {
    const groups = [];
    const seenCats = new Set();
    for (const item of visibleItems) {
      const catName = item.category_name || "";
      if (!catName) continue;
      if (!seenCats.has(catName)) {
        seenCats.add(catName);
        groups.push({ category: { name: catName }, items: [] });
      }
      groups[groups.length - 1].items.push(item);
    }
    // Add uncategorized items
    const unassigned = visibleItems.filter((item) => !item.category_name);
    if (unassigned.length > 0) {
      groups.push({ category: null, items: unassigned });
    }
    return groups;
  })();

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-[#1a3676] ${collapsed ? "w-[72px]" : "w-[260px]"} transition-all duration-300`}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex flex-col items-center gap-1.5">
        <img src={LOGO_URL} alt="RocaKami — Architects of Digital Flow" className={`object-contain rounded-2xl ${collapsed ? "w-10 h-10" : "w-full h-auto"}`} />
        {!collapsed && (
          <span className="text-sky-300 text-sm font-semibold tracking-[0.25em] uppercase">Agency OS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {visibleItems.length === 0 && (
          <p className="px-3 py-2 text-xs text-white/40">No navigation items.</p>
        )}
        {navGroups.map((group, gIdx) => {
          if (!group.items.length) return null;
          return (
            <div key={gIdx} className="mb-3">
              {!collapsed && group.category && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[#8993B4]">
                  {group.category.name}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${active
                          ? "bg-[#229ece] text-white shadow-md shadow-sky-500/20"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ROCAKAMI links (admins only) */}
      {user?.role === "admin" && (
        <div className="px-2 pb-1 pt-2 border-t border-white/10">
          {!collapsed && (
            <>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10 mb-0.5"
              >
                <Briefcase className="w-[18px] h-[18px] shrink-0" />
                <span>ROCAKAMI Job Board</span>
              </a>
              <a
                href="https://www.rocakami.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10 mb-0.5"
              >
                <Globe className="w-[18px] h-[18px] shrink-0" />
                <span>ROCAKAMI Website</span>
              </a>
            </>
          )}
          {collapsed && (
            <>
              <a
                href="#"
                className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10 mb-0.5"
              >
                <Briefcase className="w-[18px] h-[18px] shrink-0" />
              </a>
              <a
                href="https://www.rocakami.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10 mb-0.5"
              >
                <Globe className="w-[18px] h-[18px] shrink-0" />
              </a>
            </>
          )}
        </div>
      )}

      {/* Profile link (all users) */}
      <div className="px-2 pb-1 pt-2 border-t border-white/10">
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${isActive("/profile")
              ? "bg-[#229ece] text-white shadow-md shadow-sky-500/20"
              : "text-white/70 hover:text-white hover:bg-white/10"
            }
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <UserCircle className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>My Account</span>}
        </Link>
      </div>

      {/* Admin Panel link (admins only) */}
      {user?.role === "admin" && (
        <div className="px-2 pb-1 pt-2 border-t border-white/10">
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive("/admin")
                ? "bg-[#229ece] text-white shadow-md shadow-sky-500/20"
                : "text-white/70 hover:text-white hover:bg-white/10"
              }
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <Shield className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        </div>
      )}

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-white/10 text-white/50 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  if (!permsLoaded) {
    return (
      <div className="hidden lg:block w-[260px] shrink-0 bg-[#1a3676]">
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1a3676] text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="relative">{sidebarContent}</div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>
    </>
  );
}