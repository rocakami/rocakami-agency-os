import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function ProjectNotes({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ContractorNote.filter({})
      .then((all) => {
        setNotes(all.filter((n) => n.contractor_id === `project:${projectId}`));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const addNote = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.ContractorNote.create({
        contractor_id: `project:${projectId}`,
        content: content.trim()
      });
      setNotes([created, ...notes]);
      setContent("");
    } catch (e) {}
    setSaving(false);
  };

  const deleteNote = async (id) => {
    try {
      await base44.entities.ContractorNote.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (e) {}
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px]"
        />
        <Button size="sm" className="gap-2" onClick={addNote} disabled={saving || !content.trim()}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Note
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 p-3">
              <div className="min-w-0">
                <p className="text-sm text-foreground whitespace-pre-wrap">{n.content}</p>
                {n.created_date && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(n.created_date).toLocaleString()}
                  </p>
                )}
              </div>
              <button onClick={() => deleteNote(n.id)} className="text-muted-foreground hover:text-rose-500 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}