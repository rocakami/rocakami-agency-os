import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.Contractor.list("-created_date").then(setContractors).finally(() => setLoading(false));
  }, []);

  const filtered = contractors.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Contractor Management" description="Track contractors, rates, assignments, and performance" />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search contractors…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No contractors found" description="Add contractors from the Admin panel." />
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Rate</TableHead>
                  <TableHead className="font-semibold">Clients</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold">Contract</TableHead>
                  <TableHead className="font-semibold">Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        {c.email && <p className="text-[11px] text-muted-foreground">{c.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.role}</TableCell>
                    <TableCell className="text-sm font-medium">{c.rate || "—"}</TableCell>
                    <TableCell className="text-sm">{c.assigned_clients || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.payment_status} /></TableCell>
                    <TableCell><StatusBadge status={c.contract_status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}</TableCell>
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