export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = req.headers['x-user-email'];
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kemet.fr').toLowerCase();

  if (!email || email.toLowerCase() !== adminEmail) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const { id, ...fields } = req.body || {};

  if (!id) {
    return res.status(400).json({ error: 'id requis' });
  }

  /* Champs autorisés uniquement */
  const allowed = ['status', 'price', 'admin_note'];
  const patch   = {};
  for (const key of allowed) {
    if (key in fields) patch[key] = fields[key];
  }

  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Service indisponible' });
  }

  try {
    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/ebook_requests?id=eq.${id}`,
      {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer':        'return=minimal',
        },
        body: JSON.stringify(patch),
      }
    );

    if (!sbRes.ok) {
      const err = await sbRes.text();
      console.error('Supabase update error:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('admin-update-commande error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
