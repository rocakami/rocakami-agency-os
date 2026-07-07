import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, X, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { navItems } from "@/lib/nav-items";

const LOGO_URL = "https://media.base44.com/images/public/user_69df64cf7abf40c43ccdfbbf/e818e8d37_ROCAKAMILOGO.jpg";

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [allowedPaths, setAllowedPaths] = useState(null); // null = all allowed
  const [permsLoaded, setPermsLoaded] = useState(false);

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
      } catch (e) { /* default to all access on error */ }
      setPermsLoaded(true);
    };
    load();
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const visibleItems = navItems.filter((item) => {
    if (item.path === "/") return true; // Dashboard always visible
    if (!allowedPaths) return true; // null = full access
    return allowedPaths.has(item.path);
  });

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-[#1a3676] ${collapsed ? "w-[72px]" : "w-[260px]"} transition-all duration-300`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <img src={LOGO_URL} alt="RocaKami" className="w-9 h-9 rounded-lg object-contain bg-white p-0.5" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-wide">ROCAKAMI</span>
            <span className="text-sky-300 text-[10px] font-medium tracking-widest uppercase">Agency OS</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
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
      </nav>

      {/* Admin link (admins only) */}
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