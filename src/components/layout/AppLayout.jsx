import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me?.email) return;
        let matches = await base44.entities.Contractor.filter({ email: me.email });
        if (matches.length === 0 && me.full_name) {
          const nameMatches = await base44.entities.Contractor.filter({ name: me.full_name });
          if (nameMatches.length > 0) {
            await base44.entities.Contractor.update(nameMatches[0].id, { email: me.email });
          } else {
            await base44.functions.invoke('manageContractor', {
              action: 'create',
              data: { name: me.full_name || me.email, role: "", email: me.email }
            });
          }
        }
      } catch (e) { /* non-critical */ }
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        title="Refresh app for updates"
        className="fixed bottom-20 lg:bottom-6 right-4 z-40 w-11 h-11 rounded-full bg-navy-600 text-white shadow-lg hover:bg-navy-700 flex items-center justify-center transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}