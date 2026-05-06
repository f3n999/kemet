import { z } from 'zod';

/* ── Schéma de validation Zod ── */
const ContactSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
  email:  z.string().email('Adresse email invalide'),
  sujet:  z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
  envies: z.string().min(10, 'Message trop court (10 caractères min)').max(5000, 'Message trop long'),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = ContactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Données invalides',
      details: result.error.flatten().fieldErrors,
    });
  }

  const { prenom, email, sujet, envies } = result.data;

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
        console.error('Supabase insert error:', await sbRes.text());
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('contact API:', err);
    return res.status(500).json({ error: 'Erreur serveur. Veuillez réessayer.' });
  }
}
