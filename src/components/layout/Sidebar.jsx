import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, FolderOpen, Users, Briefcase, UserCheck, Building2,
  Wrench, GraduationCap, Megaphone, Settings, ChevronLeft, ChevronRight,
  Menu, X
} from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/user_69df64cf7abf40c43ccdfbbf/e818e8d37_ROCAKAMILOGO.jpg";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "SOP Library", path: "/sops", icon: BookOpen },
  { label: "Documents", path: "/documents", icon: FolderOpen },
  { label: "Onboarding", path: "/onboarding", icon: Users },
  { label: "Client Delivery", path: "/client-delivery", icon: Briefcase },
  { label: "Client Directory", path: "/clients", icon: Building2 },
  { label: "Contractors", path: "/contractors", icon: UserCheck },
  { label: "Tools Directory", path: "/tools", icon: Wrench },
  { label: "Training", path: "/training", icon: GraduationCap },
  { label: "Announcements", path: "/announcements", icon: Megaphone },
  { label: "Admin", path: "/admin", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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
        {navItems.map((item) => {
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

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-white/10 text-white/50 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

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