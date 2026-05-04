import Stripe from 'stripe';

/* Prix maîtres — doivent rester en sync avec DEFAULT_PRICES dans auth.js */
const PRICES = {
  'pyramides-science':           7.99,
  'nefertiti-enquete':           6.99,
  'hatchepsout-regne-efface':    7.99,
  'ramses-propagande':           8.99,
  'momification-manuel':         6.99,
  'toutankhamon-tresor':         5.99,
  'voyager-egypte-guide':        9.99,
  'cleopatre-derniere-pharaone': 7.99,
};

const TITLES = {
  'pyramides-science':           'Les pyramides de Gizeh : Ce que la science sait vraiment',
  'nefertiti-enquete':           'Néfertiti : Enquête sur la reine disparue',
  'hatchepsout-regne-efface':    'Hatchepsout : Vingt ans de règne effacé de l\'histoire',
  'ramses-propagande':           'Ramsès II : Le roi qui a réinventé la victoire',
  'momification-manuel':         'La momification : Manuel d\'éternité',
  'toutankhamon-tresor':         'Toutânkhamon : Le trésor et les questions sans réponse',
  'voyager-egypte-guide':        'Voyager en Égypte : Le guide des sites archéologiques essentiels',
  'cleopatre-derniere-pharaone': 'Cléopâtre VII : La dernière pharaone face à Rome',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, email } = req.body || {};

  if (!slug || !email) {
    return res.status(400).json({ error: 'slug et email requis' });
  }

  const priceEur = PRICES[slug];
  if (!priceEur) {
    return res.status(404).json({ error: 'Ebook introuvable ou gratuit' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(503).json({ error: 'Paiement temporairement indisponible' });
  }

  try {
    const stripe  = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
    const baseUrl = process.env.BASE_URL || 'https://bdd-momo.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode:           'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency:     'eur',
          unit_amount:  Math.round(priceEur * 100),
          product_data: {
            name:        `Ebook Kemet — ${TITLES[slug] || slug}`,
            description: 'Ebook numérique, accès immédiat après paiement.',
          },
        },
        quantity: 1,
      }],
      metadata:    { slug, email },
      success_url: `${baseUrl}/checkout-success.html?slug=${slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/ebooks.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe create-checkout error:', err);
    return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
}
