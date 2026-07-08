import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, ExternalLink, Loader2, Paperclip, FolderOpen } from "lucide-react";

export default function ContractorFiles({ contractorId, contractorName, folderUrl }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const list = await base44.entities.ContractorFile.filter({ contractor_id: contractorId });
      setFiles(list);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { load(); }, [contractorId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Step 1: Upload to Base44 storage
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      // Step 2: Move file into contractor's personal Drive folder
      const res = await base44.functions.invoke("uploadContractorFile", {
        contractor_id: contractorId,
        file_url: uploadRes.file_url,
        file_name: file.name
      });
      // Step 3: Save a record for easy listing
      await base44.entities.ContractorFile.create({
        contractor_id: contractorId,
        file_name: file.name,
        drive_url: res.data.drive_url,
        uploaded_by_name: contractorName || "—"
      });
      toast({ title: "File uploaded to personal folder" });
      load();
    } catch (err) {
      toast({ title: "Upload failed", description: "Make sure the contractor has a personal folder.", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="py-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Files</h3>
          </div>
          {folderUrl && (
            <label className={`inline-flex items-center gap-2 h-8 rounded-md px-3 text-xs font-medium border shadow-sm cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground"}`}>
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload File
            </label>
          )}
        </div>
        {!folderUrl ? (
          <div className="flex flex-col items-center py-6 text-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No personal folder assigned. An admin needs to generate one first.</p>
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No files uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <a key={f.id} href={f.drive_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file_name}</p>
                  {f.uploaded_by_name && <p className="text-[11px] text-muted-foreground">Uploaded by {f.uploaded_by_name}</p>}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}