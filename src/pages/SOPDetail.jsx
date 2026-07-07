import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, Wrench, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";
import ReactMarkdown from "react-markdown";

export default function SOPDetail() {
  const { id } = useParams();
  const [sop, setSop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SOP.get(id).then(setSop).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  if (!sop) {
    return <div className="text-center py-16 text-muted-foreground">SOP not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/sops" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to SOP Library
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{sop.title}</h1>
          <p className="text-sm text-muted-foreground">{sop.category}</p>
        </div>
        <StatusBadge status={sop.status} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-sm"><CardContent className="py-3 px-4 flex items-center gap-3"><User className="w-4 h-4 text-muted-foreground" /><div><p className="text-[11px] text-muted-foreground">Owner</p><p className="text-sm font-medium">{sop.owner || "Unassigned"}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="py-3 px-4 flex items-center gap-3"><Calendar className="w-4 h-4 text-muted-foreground" /><div><p className="text-[11px] text-muted-foreground">Last Updated</p><p className="text-sm font-medium">{new Date(sop.updated_date).toLocaleDateString()}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="py-3 px-4 flex items-center gap-3"><FileText className="w-4 h-4 text-muted-foreground" /><div><p className="text-[11px] text-muted-foreground">Department</p><p className="text-sm font-medium">{sop.department || "General"}</p></div></CardContent></Card>
      </div>

      {sop.purpose && (
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="py-5 px-6">
            <h3 className="font-semibold text-sm mb-2">Purpose</h3>
            <p className="text-sm text-muted-foreground">{sop.purpose}</p>
          </CardContent>
        </Card>
      )}

      {sop.steps && (
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="py-5 px-6">
            <h3 className="font-semibold text-sm mb-3">Step-by-Step Instructions</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <ReactMarkdown>{sop.steps}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {sop.tools_needed && (
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="py-5 px-6">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Wrench className="w-4 h-4" /> Tools Needed</h3>
            <p className="text-sm text-muted-foreground">{sop.tools_needed}</p>
          </CardContent>
        </Card>
      )}

      {sop.related_templates && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-5 px-6">
            <h3 className="font-semibold text-sm mb-2">Related Templates</h3>
            <p className="text-sm text-muted-foreground">{sop.related_templates}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}