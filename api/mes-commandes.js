export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email  = req.headers['x-user-email'];
  const userId = req.headers['x-user-id'];

  if (!email) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Service indisponible' });
  }

  try {
    /* Chercher par user_id OU par email */
    let url = `${supabaseUrl}/rest/v1/ebook_requests?select=id,sujet,status,price,is_surprise,created_at,paid_at,admin_note,delivery_url&order=created_at.desc`;
    if (userId) {
      url += `&or=(user_id.eq.${userId},email.eq.${encodeURIComponent(email)})`;
    } else {
      url += `&email=eq.${encodeURIComponent(email.toLowerCase())}`;
    }

    const sbRes = await fetch(url, {
      headers: {
        'apikey':        supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    if (!sbRes.ok) {
      const err = await sbRes.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    const data = await sbRes.json();
    return res.status(200).json(data || []);

  } catch (err) {
    console.error('mes-commandes API:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
