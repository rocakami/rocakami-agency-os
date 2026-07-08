import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Video, FileText, CheckSquare, ListChecks, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

const typeIcons = { Video, "Written Guide": FileText, Quiz: CheckSquare, Checklist: ListChecks };

export default function TrainingCenter() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Training.list("order"),
      base44.auth.me()
    ]).then(([trns, me]) => {
      setTrainings(trns);
      setCompleted(me.training_completed || []);
    }).finally(() => setLoading(false));
  }, []);

  const toggleTraining = async (trainingId) => {
    const newCompleted = completed.includes(trainingId)
      ? completed.filter((k) => k !== trainingId)
      : [...completed, trainingId];
    setCompleted(newCompleted);
    try {
      await base44.auth.updateMe({ training_completed: newCompleted });
    } catch (e) {
      setCompleted(completed);
    }
  };

  const categories = [...new Set(trainings.map((t) => t.role_path).filter(Boolean))];
  const filtered = trainings.filter((t) =>
    (typeFilter === "All" || t.type === typeFilter) &&
    (categoryFilter === "All" || t.role_path === categoryFilter)
  );
  const rolePaths = categories;
  const completionPct = trainings.length > 0 ? Math.round((completed.length / trainings.length) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Training Center" description="Learning paths, guides, and training materials for the team" />

      {/* Progress bar */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your training progress</span>
            <span className="text-sm font-bold text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{completed.length} of {trainings.length} modules completed</p>
        </CardContent>
      </Card>

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

      <div className="mb-6 flex gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
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
        <Card className="border-0 shadow-sm">
          <CardContent className="py-6 px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-navy-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Training Modules</h3>
                <p className="text-xs text-muted-foreground">Complete each lesson and check it off as you go</p>
              </div>
            </div>
            <div className="space-y-2">
              {filtered.map((t) => {
                const Icon = typeIcons[t.type] || FileText;
                const isChecked = completed.includes(t.id);
                return (
                  <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isChecked ? "bg-emerald-50/50 border-emerald-200" : "hover:bg-muted/30"}`}>
                    <Checkbox checked={isChecked} onCheckedChange={() => toggleTraining(t.id)} />
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isChecked ? "line-through text-muted-foreground/60" : ""}`}>{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.type}{t.role_path ? ` · ${t.role_path}` : ""}</p>
                      {t.content && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.content}</p>}
                    </div>
                    {t.completion_required && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded whitespace-nowrap">Required</span>
                    )}
                    {t.video_url && (
                      <a href={t.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium whitespace-nowrap">
                        <ExternalLink className="w-3 h-3" />
                        View Lesson
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}