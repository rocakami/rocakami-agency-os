import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Look up the user's CURRENT role from the database (token may be stale)
    const freshUser = await base44.asServiceRole.entities.User.filter({ id: user.id });
    const currentRole = freshUser?.[0]?.role || user.role;
    if (currentRole !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));

    // Action: update a user's role
    if (body.action === 'setRole') {
      const { targetUserId, role } = body;
      if (!targetUserId) return Response.json({ error: 'targetUserId is required' }, { status: 400 });
      if (!['admin', 'user'].includes(role)) return Response.json({ error: 'Invalid role' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.User.update(targetUserId, { role });
      return Response.json(updated);
    }

    // Default: list all users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});