export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callerEmail = req.headers['x-user-email'];
  const adminEmail  = (process.env.ADMIN_EMAIL || 'admin@kemet.fr').toLowerCase();

  if (!callerEmail || callerEmail.toLowerCase() !== adminEmail) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Service indisponible' });
  }

  const headers = {
    'apikey':        supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };

  try {
    /* 1. Auth users (emails) via Supabase admin API */
    const authRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?per_page=1000`,
      { headers }
    );
    const authData  = authRes.ok ? await authRes.json() : { users: [] };
    const authUsers = authData.users || [];

    const emailMap = {};
    authUsers.forEach(u => { emailMap[u.id] = u.email; });

    /* 2. Profiles */
    const profilesRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id,name,role,created_at`,
      { headers }
    );
    const profiles = profilesRes.ok ? await profilesRes.json() : [];

    /* 3. Purchases */
    const purchasesRes = await fetch(
      `${supabaseUrl}/rest/v1/user_purchases?select=user_id,ebook_slug`,
      { headers }
    );
    const purchases = purchasesRes.ok ? await purchasesRes.json() : [];

    /* 4. Build purchase map */
    const purchaseMap = {};
    (purchases || []).forEach(p => {
      if (!purchaseMap[p.user_id]) purchaseMap[p.user_id] = [];
      purchaseMap[p.user_id].push(p.ebook_slug);
    });

    /* 5. Join */
    const users = (profiles || []).map(p => ({
      id:        p.id,
      name:      p.name || emailMap[p.id] || p.id,
      email:     emailMap[p.id] || '—',
      role:      p.role || 'user',
      createdAt: p.created_at,
      purchases: purchaseMap[p.id] || [],
    }));

    return res.status(200).json(users);
  } catch (err) {
    console.error('admin-users error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
