import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wrench, ExternalLink, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ToolDetailDialog from "@/components/tools/ToolDetailDialog";

export default function ToolsDirectory() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedTool, setSelectedTool] = useState(null);

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

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 inline ml-1 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 inline ml-1 text-navy-600" /> : <ArrowDown className="w-3 h-3 inline ml-1 text-navy-600" />;
  };

  const sorted = [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortField === "name") {
      valA = (a.name || "").toLowerCase();
      valB = (b.name || "").toLowerCase();
    } else if (sortField === "owner") {
      valA = (a.owner || "").toLowerCase();
      valB = (b.owner || "").toLowerCase();
    } else if (sortField === "username") {
      valA = (a.username || "").toLowerCase();
      valB = (b.username || "").toLowerCase();
    }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
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

      {sorted.length === 0 ? (
        <EmptyState icon={Wrench} title="No tools found" description="Try adjusting your search or filter." />
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort("name")}>Tool Name <SortIcon field="name" /></TableHead>
                  <TableHead className="font-semibold">URL</TableHead>
                  <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort("username")}>Username <SortIcon field="username" /></TableHead>
                  <TableHead className="font-semibold">Password</TableHead>
                  <TableHead className="font-semibold">Access</TableHead>
                  <TableHead className="font-semibold cursor-pointer select-none" onClick={() => toggleSort("owner")}>Owner <SortIcon field="owner" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((tool) => (
                  <TableRow key={tool.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedTool(tool)}>
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
                    <TableCell className="text-sm">{tool.username || "—"}</TableCell>
                    <TableCell className="text-sm font-mono">{tool.password ? "••••••" : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tool.access_instructions || "—"}</TableCell>
                    <TableCell className="text-sm">{tool.owner || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ToolDetailDialog tool={selectedTool} open={!!selectedTool} onOpenChange={(v) => !v && setSelectedTool(null)} />
    </div>
  );
}