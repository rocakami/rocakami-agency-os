import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { contractor_id, file_url, file_name } = await req.json();
    if (!contractor_id || !file_url) return Response.json({ error: 'contractor_id and file_url are required' }, { status: 400 });

    const contractor = await base44.entities.Contractor.get(contractor_id);
    if (!contractor) return Response.json({ error: 'Contractor not found' }, { status: 404 });
    if (!contractor.folder_url) return Response.json({ error: 'Contractor has no personal folder assigned' }, { status: 400 });

    // Extract folder ID from the Drive folder URL
    const folderId = contractor.folder_url.match(/folders\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!folderId) return Response.json({ error: 'Could not extract folder ID from folder URL' }, { status: 400 });

    // Download the uploaded file from Base44 storage
    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) return Response.json({ error: 'Failed to download file' }, { status: 500 });
    const fileBlob = await fileResponse.blob();

    // Get Google Drive access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Upload to the contractor's personal Drive folder using multipart upload
    const metadata = { name: file_name || 'uploaded_file', parents: [folderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');
    form.append('file', fileBlob, file_name || 'uploaded_file');

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: form,
      }
    );

    if (!uploadResponse.ok) {
      const err = await uploadResponse.json();
      return Response.json({ error: err.error?.message || 'Failed to upload file to Drive' }, { status: 500 });
    }

    const file = await uploadResponse.json();
    const driveUrl = `https://drive.google.com/file/d/${file.id}/view`;

    return Response.json({ drive_url: driveUrl, file_id: file.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});