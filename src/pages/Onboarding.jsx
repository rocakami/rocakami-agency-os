import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/shared/PageHeader";
import { getNavIcon } from "@/lib/nav-icons";
import { Loader2, ExternalLink } from "lucide-react";

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("docs.google.com") && url.includes("/edit")) {
    return url.replace("/edit", "/preview");
  }
  return url;
};

export default function Onboarding() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.OnboardingSection.list("order"),
      base44.auth.me()
    ])
      .then(([secs, me]) => {
        setSections(secs);
        setCompleted(me.onboarding_completed || []);
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

  const parseItem = (raw) => {
    const [text, link] = raw.split("|");
    return { text: text.trim(), link: link ? link.trim() : null };
  };

  // Split sections: regular (no document_url) vs lesson sections (with document_url)
  const regularSections = sections.filter((s) => !s.document_url);
  const lessonSections = sections.filter((s) => s.document_url);

  // Calculate completion
  const totalItems = sections.reduce((acc, s) => {
    const itemCount = s.items ? s.items.split("\n").filter(Boolean).length : 0;
    const docCount = s.document_url ? 1 : 0;
    return acc + itemCount + docCount;
  }, 0);
  const completedCount = completed.length;
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
            {regularSections.map((section) => {
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

          {/* Lesson sections — full width, at the very bottom */}
          {lessonSections.map((section) => {
            const Icon = getNavIcon(section.icon);
            const docKey = `${section.id}-doc`;
            const isChecked = completed.includes(docKey);
            const embedUrl = getEmbedUrl(section.document_url);
            return (
              <Card key={section.id} className="border-0 shadow-sm mt-6">
                <CardContent className="py-6 px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${section.color || "bg-navy-600"} text-white flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">{section.title}</h3>
                      {section.content && <p className="text-xs text-muted-foreground mt-0.5">{section.content}</p>}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isChecked ? "bg-emerald-50/50 border-emerald-200" : "bg-muted/30"}`}>
                      <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(docKey)} id={`doc-${section.id}`} />
                      <label htmlFor={`doc-${section.id}`} className="text-xs font-medium cursor-pointer">
                        {isChecked ? "Completed" : "Mark complete"}
                      </label>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-muted/20">
                    <iframe src={embedUrl} className="w-full" style={{ minHeight: "600px" }} title={section.title} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <a href={section.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium">
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}