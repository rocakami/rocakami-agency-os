import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, FolderOpen, Download, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

const categories = ["All", "Company Policies", "Client Templates", "Proposal Templates", "Contracts", "Internal Checklists", "Training Materials", "Brand Assets", "Meeting Notes"];

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    base44.entities.Document.list("-updated_date").then(setDocs).finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter((d) => {
    if (category !== "All" && d.category !== category) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Document Repository" description="All company documents, templates, and policies in one place" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents found" description="Upload documents from the Admin panel." />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid items-center gap-4 px-4 py-2.5 bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider" style={{ gridTemplateColumns: "1fr 7rem 7rem 6rem 7rem" }}>
            <span>Title</span>
            <span>Status</span>
            <span className="hidden md:block">Last Updated</span>
            <span className="hidden sm:block">Link</span>
            <span className="hidden sm:block">Owner</span>
          </div>
          {filtered.map((doc, idx) => (
            <div key={doc.id} className={`grid items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors ${idx !== filtered.length - 1 ? "border-b border-border" : ""}`} style={{ gridTemplateColumns: "1fr 7rem 7rem 6rem 7rem" }}>
              <span className="font-medium text-sm truncate">{doc.title}</span>
              <div><StatusBadge status={doc.status} /></div>
              <span className="text-xs text-muted-foreground hidden md:block">{new Date(doc.updated_date).toLocaleDateString()}</span>
              <span className="hidden sm:block">
                {doc.file_url
                  ? <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline font-medium">Here</a>
                  : <span className="text-xs text-muted-foreground/50">—</span>
                }
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block truncate">{doc.owner || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}