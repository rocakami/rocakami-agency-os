import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PARENT_FOLDER_ID = "1R8gyVFKjA-IOViKnfyLiYjoKI84UhEeA";
const SUBFOLDERS = ["Brand Assets", "Contracts & Agreements", "Reports", "Meeting Notes"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { client_id } = await req.json();
    if (!client_id) return Response.json({ error: 'client_id is required' }, { status: 400 });

    const client = await base44.entities.Client.get(client_id);
    if (!client) return Response.json({ error: 'Client not found' }, { status: 404 });

    if (client.drive_folder_url) {
      return Response.json({ folder_url: client.drive_folder_url, message: 'Folder already exists' });
    }

    const companyName = (client.company_name || client.name || "").trim();
    if (!companyName) {
      return Response.json({ error: 'Client must have a company name' }, { status: 400 });
    }

    const folderName = companyName.replace(/[\\/:*?"<>|]/g, '').trim();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const createFolder = async (name, parentId) => {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to create folder');
      }
      return await response.json();
    };

    const mainFolder = await createFolder(folderName, PARENT_FOLDER_ID);

    for (const subfolderName of SUBFOLDERS) {
      await createFolder(subfolderName, mainFolder.id);
    }

    const folderUrl = `https://drive.google.com/drive/folders/${mainFolder.id}`;
    await base44.entities.Client.update(client_id, { drive_folder_url: folderUrl });

    return Response.json({ folder_url: folderUrl, folder_id: mainFolder.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});