export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body manually — Vercel static-output projects don't auto-parse JSON
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== 'object') {
    body = {};
  }

  const { prenom, email, sujet, envies } = body;

  if (!prenom || !email || !sujet || !envies) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email invalide.' });
  }

  try {
    const supabaseUrl  = process.env.SUPABASE_URL;
    const supabaseKey  = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const sbRes = await fetch(`${supabaseUrl}/rest/v1/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ prenom, email, sujet, message: envies })
      });
      if (!sbRes.ok) {
        const err = await sbRes.text();
        console.error('Supabase insert error:', err);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('contact API:', err);
    return res.status(500).json({ error: 'Erreur serveur. Veuillez réessayer.' });
  }
}
