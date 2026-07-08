import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { getNavIcon } from "@/lib/nav-icons";
import { Check, ExternalLink, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("docs.google.com") && url.includes("/edit")) {
    return url.replace("/edit", "/preview");
  }
  return url;
};

export default function OnboardingClassModule({ lessons, completed, toggleItem }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (lessons.length === 0) return null;

  const clampedIdx = Math.min(activeIdx, lessons.length - 1);
  const activeLesson = lessons[clampedIdx];
  const docKey = `${activeLesson.id}-doc`;
  const isChecked = completed.includes(docKey);
  const Icon = getNavIcon(activeLesson.icon);

  const completedCount = lessons.filter((l) => completed.includes(`${l.id}-doc`)).length;
  const progressPct = Math.round((completedCount / lessons.length) * 100);

  const goNext = () => {
    if (clampedIdx < lessons.length - 1) setActiveIdx(clampedIdx + 1);
  };
  const goPrev = () => {
    if (clampedIdx > 0) setActiveIdx(clampedIdx - 1);
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-600 text-white flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Onboarding Class Module</h3>
            <p className="text-xs text-muted-foreground">{completedCount} of {lessons.length} lessons completed</p>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">{progressPct}%</span>
      </div>

      <div className="flex" style={{ minHeight: "640px" }}>
        {/* Left sidebar — table of contents */}
        <div className="w-64 shrink-0 border-r border-border bg-muted/20 overflow-y-auto" style={{ maxHeight: "640px" }}>
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Table of Contents</p>
            <div className="space-y-0.5">
              {lessons.map((lesson, i) => {
                const key = `${lesson.id}-doc`;
                const isDone = completed.includes(key);
                const isActive = i === clampedIdx;
                const LIcon = getNavIcon(lesson.icon);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                      isActive ? "bg-navy-50 text-navy-700" : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDone ? "bg-emerald-500 text-white" : isActive ? "bg-navy-600 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                    }`}>
                      {isDone ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className={`text-xs font-medium line-clamp-2 flex-1 ${isActive ? "" : "text-muted-foreground"}`}>{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right content pane */}
        <div className="flex-1 flex flex-col">
          {/* Lesson header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg ${activeLesson.color || "bg-navy-600"} text-white flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Lesson {clampedIdx + 1} of {lessons.length}
                </p>
                <h4 className="text-sm font-bold truncate">{activeLesson.title}</h4>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors shrink-0 ml-3 ${
              isChecked ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-border"
            }`}>
              <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(docKey)} id={`doc-${activeLesson.id}`} />
              <label htmlFor={`doc-${activeLesson.id}`} className="text-xs font-medium cursor-pointer whitespace-nowrap">
                {isChecked ? "Completed" : "Mark complete"}
              </label>
            </div>
          </div>

          {/* Embedded document */}
          <div className="flex-1 bg-white overflow-hidden">
            <iframe
              src={getEmbedUrl(activeLesson.document_url)}
              className="w-full h-full border-0"
              style={{ minHeight: "500px" }}
              title={activeLesson.title}
            />
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/20">
            <button
              onClick={goPrev}
              disabled={clampedIdx === 0}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <a
              href={activeLesson.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Open in new tab
            </a>
            <button
              onClick={goNext}
              disabled={clampedIdx === lessons.length - 1}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar at the bottom */}
      <div className="px-5 py-3 border-t border-border">
        <Progress value={progressPct} className="h-1.5" />
      </div>
    </div>
  );
}