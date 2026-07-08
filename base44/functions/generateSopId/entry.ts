import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find the max sequence number across ALL SOPs regardless of department prefix
    const existing = await base44.asServiceRole.entities.SOP.list('-created_date', 500);
    let maxSeq = 0;
    existing.forEach((s) => {
      if (s.document_id) {
        // Extract the trailing number from any format (e.g. SOP RK-MK-001, SOP RK-002)
        const match = s.document_id.match(/(\d+)\s*$/);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        }
      }
    });
    const seqNum = String(maxSeq + 1).padStart(3, '0');
    const documentId = `SOP RK-${seqNum}`;

    return Response.json({ document_id: documentId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});