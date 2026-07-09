import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow direct admin calls and workflow (service-role) calls
    let useServiceRole = true;
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      useServiceRole = user?.role === 'admin' ? false : true;
    } catch (_e) {
      useServiceRole = true;
    }

    const svc = useServiceRole ? base44.asServiceRole : base44;

    const clients = await svc.entities.Client.list();
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);

    // Fetch existing auto-generated announcements to avoid duplicates
    const existing = await svc.entities.Announcement.filter({ is_auto_generated: true });
    const existingTitles = new Set(existing.map((a) => a.title));

    const created = [];

    for (const client of clients) {
      if (!client.contract_expiration_date) continue;

      const expDate = new Date(client.contract_expiration_date);
      if (isNaN(expDate.getTime())) continue;

      // Only announce contracts expiring within the next 14 days
      if (expDate < now || expDate > twoWeeksFromNow) continue;

      const clientLabel = client.company_name || client.name || 'Unknown Client';
      const title = `Contract Expiring: ${clientLabel}`;
      if (existingTitles.has(title)) continue;

      const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

      await svc.entities.Announcement.create({
        title,
        content: `The contract for ${clientLabel} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${expDate.toLocaleDateString()}). Please review and arrange renewal if needed.`,
        category: 'Process Update',
        priority: 'High',
        author: 'System',
        pinned: false,
        visibility: 'Managers & Leads',
        is_auto_generated: true,
      });

      created.push(title);
    }

    return Response.json({ success: true, checked: clients.length, created: created.length, items: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});