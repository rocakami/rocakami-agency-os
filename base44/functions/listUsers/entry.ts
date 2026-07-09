import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const steps = [];

  try {
    const base44 = createClientFromRequest(req);

    let user;
    try {
      user = await base44.auth.me();
      steps.push('auth.me: ok, role=' + user?.role + ', email=' + user?.email);
    } catch (e) {
      return Response.json({ error: 'auth.me failed: ' + e.message, steps }, { status: 500 });
    }

    if (!user) return Response.json({ error: 'Unauthorized', steps }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    if (body.action === 'setRole') {
      const { targetUserId, role } = body;
      if (!targetUserId || !['admin', 'user'].includes(role)) {
        return Response.json({ error: 'Invalid params', steps }, { status: 400 });
      }
      const updated = await base44.asServiceRole.entities.User.update(targetUserId, { role });
      return Response.json(updated);
    }

    // List users — try asServiceRole first
    let users;
    try {
      users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      steps.push('asServiceRole.list: ok, count=' + users.length);
    } catch (srErr) {
      steps.push('asServiceRole.list failed: ' + srErr.message);
      // Fallback: try user-scoped (works if caller is admin via token)
      try {
        users = await base44.entities.User.list('-created_date', 500);
        steps.push('userScoped.list: ok, count=' + users.length);
      } catch (uErr) {
        steps.push('userScoped.list failed: ' + uErr.message);
        return Response.json({ error: uErr.message, steps }, { status: 500 });
      }
    }

    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message, steps }, { status: 500 });
  }
});