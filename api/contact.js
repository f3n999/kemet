export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read raw body from stream (Vercel static-output doesn't auto-parse)
  let body = {};
  try {
    const raw = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
    body = JSON.parse(raw);
  } catch (e) {
    console.error('Body parse error:', e.message);
    return res.status(400).json({ error: 'Corps de requête invalide.' });
  }

  const { prenom, email, sujet, envies } = body;

  if (!prenom || !email || !sujet || !envies) {
    console.error('Missing fields:', { prenom: !!prenom, email: !!email, sujet: !!sujet, envies: !!envies });
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
        const errText = await sbRes.text();
        console.error('Supabase insert error:', errText);
      }
    } else {
      console.error('Missing env vars — SUPABASE_URL or SUPABASE_ANON_KEY not set');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('contact API:', err);
    return res.status(500).json({ error: 'Erreur serveur. Veuillez réessayer.' });
  }
}
