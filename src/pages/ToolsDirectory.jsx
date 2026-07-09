import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wrench, ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

export default function ToolsDirectory() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");

  useEffect(() => {
    base44.entities.ToolEntry.list().then(setTools).finally(() => setLoading(false));
  }, []);

  const owners = [...new Set(tools.map((t) => t.owner).filter(Boolean))].sort();

  const filtered = tools.filter((t) => {
    const matchesSearch = !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.purpose?.toLowerCase().includes(search.toLowerCase()) ||
      t.owner?.toLowerCase().includes(search.toLowerCase());
    const matchesOwner = ownerFilter === "all" || t.owner === ownerFilter;
    return matchesSearch && matchesOwner;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Tools & Systems Directory" description="All the tools RocaKami uses, with access instructions and best practices" />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tools by name, purpose, or owner…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {owners.length > 0 && (
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Wrench} title="No tools found" description="Try adjusting your search or filter." />
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Tool Name</TableHead>
                  <TableHead className="font-semibold">URL</TableHead>
                  <TableHead className="font-semibold">Access</TableHead>
                  <TableHead className="font-semibold">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tool) => (
                  <TableRow key={tool.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-navy-600 text-white flex items-center justify-center shrink-0">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <span>{tool.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tool.url ? (
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline">
                          {tool.url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 40)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-sm text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tool.access_instructions || "—"}</TableCell>
                    <TableCell className="text-sm">{tool.owner || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}