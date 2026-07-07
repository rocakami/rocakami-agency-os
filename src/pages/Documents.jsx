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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <CardContent className="py-5 px-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm leading-snug">{doc.title}</h3>
                  <StatusBadge status={doc.status} />
                </div>
                <span className="text-[11px] text-sky-600 font-medium mb-2">{doc.category}</span>
                {doc.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{doc.description}</p>}
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    <span>{doc.owner || "—"}</span>
                    <span className="mx-1">·</span>
                    <span>{new Date(doc.updated_date).toLocaleDateString()}</span>
                  </div>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}