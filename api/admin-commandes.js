export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = req.headers['x-user-email'];
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kemet.fr').toLowerCase();

  if (!email || email.toLowerCase() !== adminEmail) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Service indisponible' });
  }

  try {
    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/ebook_requests?select=id,email,sujet,status,price,is_surprise,created_at,paid_at,admin_note&order=created_at.desc`,
      {
        headers: {
          'apikey':        supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!sbRes.ok) {
      const err = await sbRes.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    const data = await sbRes.json();
    return res.status(200).json(data || []);

  } catch (err) {
    console.error('admin-commandes error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
