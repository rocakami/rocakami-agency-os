import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Wrench, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

export default function ToolsDirectory() {
  const [tools, setTools] = useState([]);
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.ToolEntry.list().then(setTools).finally(() => setLoading(false));
    base44.entities.SOP.filter({ hidden: false }).then(setSops).catch(() => {});
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Tools & Systems Directory" description="All the tools RocaKami uses, with access instructions and best practices" />

      {tools.length === 0 ? (
        <EmptyState icon={Wrench} title="No tools added yet" description="Add tools from the Admin panel." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${selected === tool.id ? "ring-2 ring-sky-400" : ""}`}
              onClick={() => setSelected(selected === tool.id ? null : tool.id)}
            >
              <CardContent className="py-5 px-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-600 text-white flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{tool.name}</h3>
                    {tool.owner && <p className="text-[11px] text-muted-foreground">Owner: {tool.owner}</p>}
                  </div>
                </div>
                {tool.purpose && <p className="text-xs text-muted-foreground mb-3">{tool.purpose}</p>}

                {selected === tool.id && (
                  <div className="space-y-3 pt-3 border-t">
                    {tool.access_instructions && (
                      <div><p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Access</p><p className="text-xs text-muted-foreground">{tool.access_instructions}</p></div>
                    )}
                    {tool.best_practices && (
                      <div><p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Best Practices</p><p className="text-xs text-muted-foreground">{tool.best_practices}</p></div>
                    )}
                    {tool.related_sops && (() => {
                      const ids = String(tool.related_sops).split(",").map((s) => s.trim()).filter(Boolean);
                      const linked = sops.filter((s) => ids.includes(s.id));
                      if (linked.length === 0) return null;
                      return (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">REFERENCE</p>
                          <div className="flex flex-wrap gap-2">
                            {linked.map((sop) => (
                              <Link key={sop.id} to={`/sops/${sop.id}`} className="inline-flex items-center gap-1 text-xs text-sky-600 hover:underline">
                                <FileText className="w-3 h-3" />{sop.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    {tool.url && (
                      <a href={tool.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1 text-xs mt-1"><ExternalLink className="w-3.5 h-3.5" /> Open Tool</Button>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}