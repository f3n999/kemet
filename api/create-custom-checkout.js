import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { request_id, email } = req.body || {};

  if (!request_id || !email) {
    return res.status(400).json({ error: 'request_id et email requis' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const stripeKey   = process.env.STRIPE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey || !stripeKey) {
    return res.status(503).json({ error: 'Service indisponible' });
  }

  try {
    /* 1. Récupérer la commande depuis Supabase */
    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/ebook_requests?id=eq.${request_id}&select=id,email,sujet,price,status`,
      {
        headers: {
          'apikey':        supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );
    const rows = await sbRes.json();
    const request = rows?.[0];

    if (!request) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    if (request.status === 'paid' || request.status === 'delivered') {
      return res.status(400).json({ error: 'Cette commande est déjà payée' });
    }
    if (!request.price || request.price <= 0) {
      return res.status(400).json({ error: 'Le prix n\'a pas encore été fixé par l\'admin' });
    }
    if (request.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Email non autorisé pour cette commande' });
    }

    /* 2. Créer la session Stripe */
    const stripe  = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
    const baseUrl = process.env.BASE_URL || 'https://bdd-momo.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode:           'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency:     'eur',
          unit_amount:  Math.round(parseFloat(request.price) * 100),
          product_data: {
            name:        'Ebook Kemet sur mesure',
            description: request.sujet.slice(0, 150) + (request.sujet.length > 150 ? '…' : ''),
          },
        },
        quantity: 1,
      }],
      metadata: {
        type:       'custom_order',
        request_id: request_id,
        email:      email,
      },
      success_url: `${baseUrl}/dashboard.html?commande=paid`,
      cancel_url:  `${baseUrl}/dashboard.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-custom-checkout error:', err);
    return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
}
