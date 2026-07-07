import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, StickyNote } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ContractorNotes({ contractorId }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    base44.entities.ContractorNote.filter({ contractor_id: contractorId }, "-created_date")
      .then(setNotes)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [contractorId]);

  const addNote = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await base44.entities.ContractorNote.create({ contractor_id: contractorId, content: content.trim() });
      setContent("");
      load();
      toast({ title: "Note added" });
    } catch (e) {
      toast({ title: "Error adding note", variant: "destructive" });
    }
    setSaving(false);
  };

  const deleteNote = async (noteId) => {
    try {
      await base44.entities.ContractorNote.delete(noteId);
      load();
    } catch (e) {
      toast({ title: "Error deleting note", variant: "destructive" });
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Write a note…"
        />
        <Button onClick={addNote} disabled={saving || !content.trim()} size="sm" className="gap-2">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Note
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : notes.length === 0 ? (
        <div className="rounded-lg bg-muted/40 p-4 text-center">
          <StickyNote className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border p-3 group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{n.content}</p>
                <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{fmtDate(n.created_date)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}