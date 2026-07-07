import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Search, Filter, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

const categories = ["All", "Sales", "Client Onboarding", "Website Project", "CRM & GHL", "SEO", "Customer Support", "Finance & Admin", "HR & Contractor", "Automation", "Quality Assurance"];

export default function SOPLibrary() {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    base44.entities.SOP.list("-updated_date").then(setSops).finally(() => setLoading(false));
  }, []);

  const filtered = sops.filter((s) => {
    if (category !== "All" && s.category !== category) return false;
    if (status !== "All" && s.status !== status) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach((s) => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="SOP Library" description="Standard Operating Procedures for every department" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search SOPs…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {["All", "Active", "Draft", "Needs Review"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No SOPs found" description="Try adjusting your filters or add new SOPs from the Admin panel." />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((sop) => (
                  <Link key={sop.id} to={`/sops/${sop.id}`}>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                      <CardContent className="py-5 px-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="font-semibold text-sm leading-snug">{sop.title}</h4>
                          <StatusBadge status={sop.status} />
                        </div>
                        {sop.purpose && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{sop.purpose}</p>}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{sop.owner || "Unassigned"}</span>
                          <span>{new Date(sop.updated_date).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}