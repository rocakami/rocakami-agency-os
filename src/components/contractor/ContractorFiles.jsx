import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Upload, ExternalLink, Loader2, Paperclip, FolderOpen } from "lucide-react";

export default function ContractorFiles({ contractorId, contractorName, folderUrl }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const list = await base44.entities.ContractorFile.filter({ contractor_id: contractorId }, "-created_date");
      setFiles(list);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { load(); }, [contractorId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("uploadContractorFile", {
        contractor_id: contractorId,
        file_url: uploadRes.file_url,
        file_name: file.name
      });
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

  const fmtDate = (d) => d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

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
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[100px]">Link</TableHead>
                  <TableHead className="w-[180px]">Date Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="text-sm font-medium truncate max-w-xs">{f.file_name}</TableCell>
                    <TableCell>
                      <a href={f.drive_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-600 hover:underline font-medium">
                        <ExternalLink className="w-3 h-3" /> Open
                      </a>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmtDate(f.created_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}