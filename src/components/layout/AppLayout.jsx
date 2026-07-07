import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me?.email) return;
        const matches = await base44.entities.Contractor.filter({ email: me.email });
        if (matches.length === 0) {
          await base44.entities.Contractor.create({
            name: me.full_name || me.email,
            role: "",
            email: me.email
          });
        }
      } catch (e) { /* non-critical */ }
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}