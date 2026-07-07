import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Video, FileText, CheckSquare, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

const typeIcons = { Video, "Written Guide": FileText, Quiz: CheckSquare, Checklist: ListChecks };

export default function TrainingCenter() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    base44.entities.Training.list("order").then(setTrainings).finally(() => setLoading(false));
  }, []);

  const filtered = trainings.filter((t) => typeFilter === "All" || t.type === typeFilter);

  const rolePaths = [...new Set(trainings.map((t) => t.role_path).filter(Boolean))];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Training Center" description="Learning paths, guides, and training materials for the team" />

      {rolePaths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Learning Paths</h3>
          <div className="flex flex-wrap gap-2">
            {rolePaths.map((r) => (
              <span key={r} className="px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-medium rounded-lg">{r}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            {["All", "Video", "Written Guide", "Quiz", "Checklist"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No training materials yet" description="Add training content from the Admin panel." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const Icon = typeIcons[t.type] || FileText;
            return (
              <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="py-5 px-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t.title}</h3>
                      <p className="text-[11px] text-muted-foreground">{t.type}{t.role_path ? ` · ${t.role_path}` : ""}</p>
                    </div>
                  </div>
                  {t.content && <p className="text-xs text-muted-foreground line-clamp-3">{t.content}</p>}
                  {t.completion_required && (
                    <span className="inline-block mt-3 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Required</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}