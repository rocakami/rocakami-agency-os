import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

const fallbackCategories = ["Sales", "Client Onboarding", "Website Project", "CRM & GHL", "SEO", "Customer Support", "Finance & Admin", "HR & Contractor", "Automation", "Quality Assurance"];

export default function SOPLibrary() {
  const [sops, setSops] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    Promise.all([
      base44.entities.SOP.list("-updated_date"),
      base44.entities.SopCategory.list("order")
    ]).then(([sopList, catList]) => {
      setSops(sopList);
      if (catList.length) setCategoryOptions(catList.map((c) => c.name));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = sops.filter((s) => {
    if (s.hidden) return false;
    if (category !== "All" && s.category !== category) return false;
    if (status !== "All" && s.status !== status) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
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
          <SelectContent>{["All", ...categoryOptions].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid items-center gap-4 px-4 py-2.5 bg-muted/50 border-b border-border" style={{ gridTemplateColumns: "1fr 7rem 7rem 7rem 6rem 4rem 8rem" }}>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Title</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Doc ID</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Department</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Category</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">Link</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">Owner</span>
          </div>
          {filtered.map((sop, idx) => (
            <Link key={sop.id} to={`/sops/${sop.id}`} className={`grid items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors ${idx !== filtered.length - 1 ? "border-b border-border" : ""}`} style={{ gridTemplateColumns: "1fr 7rem 7rem 7rem 6rem 4rem 8rem" }}>
              <span className="font-medium text-sm truncate">{sop.title}</span>
              <span className="text-xs font-mono text-primary font-semibold">{sop.document_id ? sop.document_id.replace(/^SOP\s/, "") : "—"}</span>
              <span className="text-xs text-muted-foreground hidden md:block">{sop.department || "—"}</span>
              <span className="text-xs text-muted-foreground hidden md:block">{sop.category || "—"}</span>
              <div><StatusBadge status={sop.status} /></div>
              <span className="hidden sm:block">
                {sop.google_doc_url
                  ? <a href={sop.google_doc_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-sky-600 hover:underline font-medium">Here</a>
                  : <span className="text-xs text-muted-foreground/50">—</span>
                }
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block break-words">{sop.owner || "Unassigned"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}