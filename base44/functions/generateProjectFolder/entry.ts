import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PARENT_FOLDER_ID = "1a9LR4Fznr1oxWd3F4XeCI-wwz1sYLNE_";
const SUBFOLDERS = ["Contracts & Agreements", "Assets"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id } = await req.json();
    if (!project_id) return Response.json({ error: 'project_id is required' }, { status: 400 });

    const project = await base44.entities.ClientProject.get(project_id);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    if (project.folder_url) {
      return Response.json({ folder_url: project.folder_url, message: 'Folder already exists' });
    }

    const companyName = (project.client_name || "").trim();
    const projectIdPart = (project.project_id || "").trim();
    const projectName = (project.title || "").trim();
    if (!companyName) {
      return Response.json({ error: 'Project must have a client name' }, { status: 400 });
    }

    const folderName = `${companyName}_${projectIdPart}_${projectName}`.replace(/[\\/:*?"<>|]/g, '');

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
    await base44.entities.ClientProject.update(project_id, { folder_url: folderUrl });

    return Response.json({ folder_url: folderUrl, folder_id: mainFolder.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});