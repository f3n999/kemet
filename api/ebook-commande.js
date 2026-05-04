export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, sujet, is_surprise, source } = req.body || {};

  /* Validation */
  if (!email || !sujet) {
    return res.status(400).json({ error: 'email et sujet sont requis' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  if (sujet.length > 800) {
    return res.status(400).json({ error: 'Sujet trop long (max 800 caractères)' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase env vars manquants');
    return res.status(503).json({ error: 'Service temporairement indisponible' });
  }

  try {
    const sbRes = await fetch(`${supabaseUrl}/rest/v1/ebook_requests`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        email:         email.toLowerCase().trim(),
        sujet:         sujet.trim(),
        is_surprise:   Boolean(is_surprise),
        source:        source || 'web',
        status:        'pending',
        created_at:    new Date().toISOString(),
      }),
    });

    if (!sbRes.ok) {
      const errText = await sbRes.text();
      console.error('Supabase ebook_requests insert error:', errText);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
    }

    console.log(`✓ Commande ebook reçue : ${email} — is_surprise: ${is_surprise}`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('ebook-commande API:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
