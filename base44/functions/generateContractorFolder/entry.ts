import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PARENT_FOLDER_ID = "12h4Sp3fW3fFpoT2_exPU9qkS02Ks49i8";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { contractor_id } = await req.json();
    if (!contractor_id) return Response.json({ error: 'contractor_id is required' }, { status: 400 });

    const contractor = await base44.entities.Contractor.get(contractor_id);
    if (!contractor) return Response.json({ error: 'Contractor not found' }, { status: 404 });

    if (!contractor.employee_id || !contractor.name) {
      return Response.json({ error: 'Contractor must have an Employee ID and Name' }, { status: 400 });
    }

    const folderName = `${contractor.employee_id} - ${contractor.name}`;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [PARENT_FOLDER_ID],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ error: err.error?.message || 'Failed to create folder' }, { status: 500 });
    }

    const folder = await response.json();
    const folderUrl = `https://drive.google.com/drive/folders/${folder.id}`;

    await base44.entities.Contractor.update(contractor_id, { folder_url: folderUrl });

    return Response.json({ folder_url: folderUrl, folder_id: folder.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});