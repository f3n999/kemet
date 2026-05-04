import Stripe from 'stripe';

/* Désactiver le body parser de Vercel — Stripe a besoin du payload brut */
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeKey     = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.error('Stripe env vars manquants');
    return res.status(503).json({ error: 'Service indisponible' });
  }

  const stripe    = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
  const rawBody   = await getRawBody(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return res.status(400).json({ error: 'Signature invalide' });
  }

  /* ── Paiement confirmé ── */
  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const { type, request_id, slug, email } = session.metadata || {};

    /* ── Commande sur mesure ── */
    if (type === 'custom_order' && request_id) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/ebook_requests?id=eq.${request_id}`, {
            method:  'PATCH',
            headers: {
              'Content-Type':  'application/json',
              'apikey':        supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer':        'return=minimal',
            },
            body: JSON.stringify({
              status:         'paid',
              stripe_session: session.id,
              paid_at:        new Date().toISOString(),
            }),
          });
          console.log(`✓ Commande sur mesure payée : ${request_id}`);
        } catch (err) {
          console.error('Webhook custom order error:', err);
        }
      }
      return res.status(200).json({ received: true });
    }

    if (!slug || !email) {
      console.error('Metadata manquante dans la session Stripe');
      return res.status(200).json({ received: true }); // ne pas retry
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase env vars manquants');
      return res.status(200).json({ received: true });
    }

    try {
      /* 1. Trouver l'user_id via son email */
      const userRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
        {
          headers: {
            'apikey':         supabaseKey,
            'Authorization':  `Bearer ${supabaseKey}`,
          }
        }
      );
      const userData = await userRes.json();
      const userId   = userData?.users?.[0]?.id;

      if (!userId) {
        console.warn(`Webhook: aucun user trouvé pour ${email}, accès ignoré`);
        return res.status(200).json({ received: true });
      }

      /* 2. Insérer dans user_purchases */
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/user_purchases`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer':        'return=minimal,resolution=ignore-duplicates',
        },
        body: JSON.stringify({
          user_id:         userId,
          ebook_slug:      slug,
          stripe_session:  session.id,
          purchased_at:    new Date().toISOString(),
        }),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error('Supabase insert error:', errText);
      } else {
        console.log(`✓ Accès accordé : ${email} → ${slug}`);
      }
    } catch (err) {
      console.error('Webhook DB error:', err);
    }
  }

  return res.status(200).json({ received: true });
}
