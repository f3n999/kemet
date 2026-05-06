import { z } from 'zod';

/* ── Schéma de validation Zod ── */
const EbookCommandeSchema = z.object({
  email:       z.string().email('Adresse email invalide'),
  sujet:       z.string().min(5, 'Décrivez votre sujet (5 caractères min)').max(800, 'Sujet trop long'),
  user_id:     z.string().uuid().optional().nullable(),
  is_surprise: z.boolean().optional().default(false),
  source:      z.enum(['web', 'admin', 'api']).optional().default('web'),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = EbookCommandeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Données invalides',
      details: result.error.flatten().fieldErrors,
    });
  }

  const { email, sujet, user_id, is_surprise, source } = result.data;

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
        email:       email.toLowerCase().trim(),
        sujet:       sujet.trim(),
        user_id:     user_id || null,
        is_surprise: Boolean(is_surprise),
        source:      source || 'web',
        status:      'pending',
        created_at:  new Date().toISOString(),
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
