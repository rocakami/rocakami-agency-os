import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";

function getEmbedUrl(url) {
  if (!url) return null;
  // /edit → /preview for embedding
  const editMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (editMatch) {
    return `https://docs.google.com/document/d/${editMatch[1]}/preview`;
  }
  return url;
}

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

  const embedUrl = getEmbedUrl(sop.google_doc_url);

  return (
    <div className="max-w-4xl mx-auto">
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

      {embedUrl ? (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Google Doc</h3>
              <Button variant="ghost" size="sm" className="gap-1 text-sky-600" onClick={() => window.open(sop.google_doc_url, "_blank")}>
                Open in new tab <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
            <iframe
              src={embedUrl}
              className="w-full"
              style={{ height: "70vh", border: "none" }}
              title={sop.title}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No Google Doc linked to this SOP yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}