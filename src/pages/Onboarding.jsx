import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";
import { getNavIcon } from "@/lib/nav-icons";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.OnboardingSection.list("order")
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Employee Onboarding Hub" description="Everything you need to get started at RocaKami" />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {sections.map((section) => {
            const Icon = getNavIcon(section.icon);
            const items = section.items ? section.items.split("\n").filter(Boolean) : [];
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
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
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