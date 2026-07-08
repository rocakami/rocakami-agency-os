import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import PageHeader from "@/components/shared/PageHeader";
import { getNavIcon } from "@/lib/nav-icons";
import { Loader2, ExternalLink } from "lucide-react";
import OnboardingClassModule from "@/components/onboarding/OnboardingClassModule";

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

  return (
    <div>
      <PageHeader title="Employee Onboarding Hub" description="Everything you need to get started at RocaKami" />

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

          {/* Class module — full width, at the very bottom */}
          <OnboardingClassModule lessons={lessonSections} completed={completed} toggleItem={toggleItem} />
        </>
      )}
    </div>
  );
}