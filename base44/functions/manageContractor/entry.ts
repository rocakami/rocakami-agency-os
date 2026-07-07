import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const data = body.data;
      if (!data?.name || !data?.role) {
        return Response.json({ error: 'Name and role are required' }, { status: 400 });
      }

      // Generate employee ID: RK-YY####
      const year = String(new Date().getFullYear()).slice(2);
      const prefix = `RK-${year}`;
      const existing = await base44.asServiceRole.entities.Contractor.list('-created_date', 500);
      let maxSeq = 0;
      existing.forEach((c) => {
        if (c.employee_id && c.employee_id.startsWith(prefix)) {
          const seq = parseInt(c.employee_id.slice(prefix.length), 10);
          if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        }
      });
      const employeeId = `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;

      const created = await base44.asServiceRole.entities.Contractor.create({
        ...data,
        employee_id: employeeId
      });
      return Response.json(created);
    }

    if (action === 'delete') {
      const { contractor_id } = body;
      if (!contractor_id) return Response.json({ error: 'contractor_id is required' }, { status: 400 });

      const contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
      if (!contractor) return Response.json({ error: 'Contractor not found' }, { status: 404 });

      // Find and delete the associated user account by email
      if (contractor.email) {
        try {
          const users = await base44.asServiceRole.entities.User.filter({ email: contractor.email });
          for (const u of users) {
            if (u.id !== user.id) {
              await base44.asServiceRole.entities.User.delete(u.id);
            }
          }
        } catch (e) { /* user deletion may fail if not admin — continue with contractor deletion */ }
      }

      await base44.asServiceRole.entities.Contractor.delete(contractor_id);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});