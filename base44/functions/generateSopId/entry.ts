import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const prefix = body.prefix;

    if (!prefix) return Response.json({ error: 'Prefix is required' }, { status: 400 });

    // Find the max sequence number across all SOPs with this prefix
    const existing = await base44.asServiceRole.entities.SOP.list('-created_date', 500);
    let maxSeq = 0;
    const pattern = `SOP ${prefix}-`;
    existing.forEach((s) => {
      if (s.document_id && s.document_id.startsWith(pattern)) {
        const seqStr = s.document_id.slice(pattern.length).split(/\s/)[0];
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    const seqNum = String(maxSeq + 1).padStart(3, '0');
    const documentId = `SOP ${prefix}-${seqNum}`;

    return Response.json({ document_id: documentId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});