import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Generate project ID: RK####
    const prefix = 'RK';
    const existing = await base44.asServiceRole.entities.ClientProject.list('-created_date', 500);
    let maxSeq = 0;
    existing.forEach((p) => {
      if (p.project_id && p.project_id.startsWith(prefix)) {
        const seq = parseInt(p.project_id.slice(prefix.length), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    const projectId = `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;

    return Response.json({ project_id: projectId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});