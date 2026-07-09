import React, { useState } from "react";
import { Wrench, ExternalLink, KeyRound, User, Link2, FileText, Lightbulb, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ToolDetailDialog({ tool, open, onOpenChange }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-600 text-white flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            {tool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {tool.purpose && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Purpose</p>
              <p className="text-sm">{tool.purpose}</p>
            </div>
          )}

          {tool.url && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><Link2 className="w-3 h-3" /> URL</p>
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline break-all">
                {tool.url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {(tool.username || tool.password) && (
            <div className="grid grid-cols-2 gap-3">
              {tool.username && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Username</p>
                  <p className="text-sm font-mono break-all">{tool.username}</p>
                </div>
              )}
              {tool.password && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><KeyRound className="w-3 h-3" /> Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono break-all">{showPassword ? tool.password : "••••••••"}</p>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tool.access_instructions && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Access / Login Instructions</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tool.access_instructions}</p>
            </div>
          )}

          {tool.owner && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Owner</p>
              <p className="text-sm">{tool.owner}</p>
            </div>
          )}

          {tool.best_practices && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Best Practices</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tool.best_practices}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}