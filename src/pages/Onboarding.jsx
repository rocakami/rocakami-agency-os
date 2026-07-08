import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/shared/PageHeader";
import { getNavIcon } from "@/lib/nav-icons";
import { Loader2, ExternalLink, GraduationCap } from "lucide-react";

export default function Onboarding() {
  const [sections, setSections] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState([]);
  const [trainingCompleted, setTrainingCompleted] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.OnboardingSection.list("order"),
      base44.entities.Training.list("order"),
      base44.auth.me()
    ])
      .then(([secs, trns, me]) => {
        setSections(secs);
        setTrainings(trns);
        setCompleted(me.onboarding_completed || []);
        setTrainingCompleted(me.training_completed || []);
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = async (key) => {
    const newCompleted = completed.includes(key)
      ? completed.filter((k) => k !== key)
      : [...completed, key];
    setCompleted(newCompleted);
    try {
      await base44.auth.updateMe({ onboarding_completed: newCompleted });
    } catch (e) {
      setCompleted(completed);
    }
  };

  const toggleTraining = async (trainingId) => {
    const newCompleted = trainingCompleted.includes(trainingId)
      ? trainingCompleted.filter((k) => k !== trainingId)
      : [...trainingCompleted, trainingId];
    setTrainingCompleted(newCompleted);
    try {
      await base44.auth.updateMe({ training_completed: newCompleted });
    } catch (e) {
      setTrainingCompleted(trainingCompleted);
    }
  };

  const parseItem = (raw) => {
    const [text, link] = raw.split("|");
    return { text: text.trim(), link: link ? link.trim() : null };
  };

  // Calculate completion
  const totalOnboardingItems = sections.reduce((acc, s) => acc + (s.items ? s.items.split("\n").filter(Boolean).length : 0), 0);
  const totalItems = totalOnboardingItems + trainings.length;
  const completedCount = completed.length + trainingCompleted.length;
  const completionPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div>
      <PageHeader title="Employee Onboarding Hub" description="Everything you need to get started at RocaKami" />

      {/* Progress bar */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your onboarding progress</span>
            <span className="text-sm font-bold text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{completedCount} of {totalItems} items completed</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-5">
            {sections.map((section) => {
              const Icon = getNavIcon(section.icon);
              const items = section.items ? section.items.split("\n").filter(Boolean).map(parseItem) : [];
              return (
                <Card key={section.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-6 px-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${section.color || "bg-navy-600"} text-white flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base">{section.title}</h3>
                    </div>
                    {section.content && <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>}
                    {items.length > 0 && (
                      <ul className="space-y-2.5 mt-2">
                        {items.map((item, i) => {
                          const key = `${section.id}-${i}`;
                          const isChecked = completed.includes(key);
                          return (
                            <li key={i} className="flex items-center gap-2.5 text-sm">
                              <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(key)} />
                              <span className={isChecked ? "line-through text-muted-foreground/60" : "text-muted-foreground"}>
                                {item.text}
                              </span>
                              {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium ml-1">
                                  <ExternalLink className="w-3 h-3" />
                                  View
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Training Modules — full width, always at the bottom */}
          {trainings.length > 0 && (
            <Card className="border-0 shadow-sm mt-6">
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
                  {trainings.map((t) => {
                    const isChecked = trainingCompleted.includes(t.id);
                    return (
                      <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isChecked ? "bg-emerald-50/50 border-emerald-200" : "hover:bg-muted/30"}`}>
                        <Checkbox checked={isChecked} onCheckedChange={() => toggleTraining(t.id)} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isChecked ? "line-through text-muted-foreground/60" : ""}`}>{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.type}{t.role_path ? ` · ${t.role_path}` : ""}</p>
                        </div>
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
        </>
      )}
    </div>
  );
}