import React, { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getNavIcon } from "@/lib/nav-icons";
import { Check, ExternalLink, ChevronLeft, ChevronRight, BookOpen, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

function htmlToMarkdown(html) {
  let text = html;
  // Remove style/script tags
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  // Bold and italic
  text = text.replace(/<(b|strong)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  text = text.replace(/<(i|em)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  // Lists
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');
  // Links
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  // Line breaks and paragraphs
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  // Clean up excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

export default function OnboardingClassModule({ lessons, completed, toggleItem }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [contentCache, setContentCache] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [errorContent, setErrorContent] = useState(null);

  const clampedIdx = Math.min(activeIdx, Math.max(0, lessons.length - 1));
  const activeLesson = lessons[clampedIdx];
  const docKey = `${activeLesson.id}-doc`;
  const isChecked = completed.includes(docKey);
  const Icon = getNavIcon(activeLesson.icon);

  const completedCount = lessons.filter((l) => completed.includes(`${l.id}-doc`)).length;
  const progressPct = Math.round((completedCount / lessons.length) * 100);

  const fetchContent = useCallback(async (lesson, force = false) => {
    if (!force && contentCache[lesson.id]) return;
    setLoadingContent(true);
    setErrorContent(null);
    try {
      const resp = await base44.functions.invoke('fetchOnboardingDoc', { document_url: lesson.document_url });
      const rawContent = resp.data?.content || '';
      const format = resp.data?.format || 'text/plain';
      const processed = format.includes('html') ? htmlToMarkdown(rawContent) : rawContent;
      setContentCache((prev) => ({ ...prev, [lesson.id]: processed }));
    } catch (e) {
      setErrorContent(e.message || 'Failed to load document');
    } finally {
      setLoadingContent(false);
    }
  }, [contentCache]);

  useEffect(() => {
    if (activeLesson?.document_url && lessons.length > 0) {
      fetchContent(activeLesson);
    }
  }, [activeLesson?.id, lessons.length]);

  if (lessons.length === 0) return null;

  const goNext = () => { if (clampedIdx < lessons.length - 1) setActiveIdx(clampedIdx + 1); };
  const goPrev = () => { if (clampedIdx > 0) setActiveIdx(clampedIdx - 1); };

  const cachedContent = contentCache[activeLesson?.id];

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
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{progressPct}%</span>
        </div>
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
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingContent}
                onClick={() => fetchContent(activeLesson, true)}
                className="gap-1.5 h-8 text-xs"
              >
                {loadingContent ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Refresh
              </Button>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                isChecked ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-border"
              }`}>
                <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(docKey)} id={`doc-${activeLesson.id}`} />
                <label htmlFor={`doc-${activeLesson.id}`} className="text-xs font-medium cursor-pointer whitespace-nowrap">
                  {isChecked ? "Completed" : "Mark complete"}
                </label>
              </div>
            </div>
          </div>

          {/* Lesson content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 bg-white" style={{ maxHeight: "560px" }}>
            {loadingContent ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading lesson content…</p>
              </div>
            ) : errorContent ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-sm text-destructive">{errorContent}</p>
                <Button variant="outline" size="sm" onClick={() => fetchContent(activeLesson, true)} className="gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Try again
                </Button>
              </div>
            ) : cachedContent ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{cachedContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-muted-foreground">No content available</p>
              </div>
            )}
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
              Open original
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