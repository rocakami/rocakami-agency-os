import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { document_url } = await req.json();
    if (!document_url) return Response.json({ error: 'document_url required' }, { status: 400 });

    // Extract Google Doc / Slides file ID
    let fileId = null;
    let docType = 'document';
    const docMatch = document_url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (docMatch) { fileId = docMatch[1]; docType = 'document'; }
    const slidesMatch = document_url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
    if (slidesMatch) { fileId = slidesMatch[1]; docType = 'presentation'; }

    if (fileId) {
      // Try Google Drive API with OAuth token first (for private docs)
      try {
        const connection = await base44.asServiceRole.connectors.getConnection('googledrive');
        const accessToken = typeof connection === 'string' ? connection : connection?.access_token;
        if (accessToken) {
          const mimeType = docType === 'presentation' ? 'text/plain' : 'text/html';
          const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeType)}`;
          const resp = await fetch(exportUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (resp.ok) {
            const content = await resp.text();
            return Response.json({ content, format: mimeType });
          }
        }
      } catch (e) {
        // Fall through to public export
      }

      // Fallback: try public export URL
      if (docType === 'document') {
        const publicUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;
        const pubResp = await fetch(publicUrl);
        if (pubResp.ok) {
          const content = await pubResp.text();
          return Response.json({ content, format: 'text/html' });
        }
      }
      return Response.json({ error: 'Could not fetch document. Make sure it is shared.' }, { status: 500 });
    }

    // For non-Google URLs, fetch directly
    const resp = await fetch(document_url);
    const content = await resp.text();
    return Response.json({ content, format: resp.headers.get('content-type') || 'text/plain' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});