import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, FolderOpen, ExternalLink, ChevronDown, ChevronUp, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    base44.entities.Document.list("-updated_date").then(setDocs).finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter((d) => {
    if (d.hidden) return false;
    if (category !== "All" && d.category !== category) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        <div className="space-y-3">
          {filtered.map((doc) => {
            const expanded = expandedIds.has(doc.id);
            const isLong = doc.description && doc.description.length > 120;
            return (
              <Card key={doc.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => toggleExpand(doc.id)}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-navy-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <StatusBadge status={doc.status} />
                          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{doc.category}</span>
                          <span className="text-[11px] text-muted-foreground">{new Date(doc.updated_date).toLocaleDateString()}</span>
                        </div>
                        {doc.description && (
                          <p className={`text-sm text-muted-foreground mt-2 ${!expanded && isLong ? "line-clamp-2" : ""}`}>{doc.description}</p>
                        )}
                        {expanded && (
                          <div className="mt-3 space-y-2">
                            {doc.file_url && (
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline">
                                <ExternalLink className="w-3.5 h-3.5" /> Open file
                              </a>
                            )}
                            {doc.owner && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3" /> {doc.owner}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {(isLong || doc.file_url || doc.owner) && (
                      <button onClick={(e) => { e.stopPropagation(); toggleExpand(doc.id); }} className="text-muted-foreground hover:text-foreground shrink-0 mt-1">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}