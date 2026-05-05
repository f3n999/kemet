const BASE_URL = process.env.BASE_URL || 'https://bdd-momo.vercel.app';

async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: 'RESEND_API_KEY non configuré' };

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      from:    'Kemet <onboarding@resend.dev>',
      to:      [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return { sent: false, reason: err };
  }
  return { sent: true };
}

function emailAccepte({ email, sujet, price }) {
  return {
    to:      email,
    subject: 'Votre commande Kemet a été acceptée',
    html: `
      <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; color:#1a1a1a;">
        <div style="background:#0d0d0d; padding:28px 32px; text-align:center;">
          <h1 style="color:#C9A84C; font-size:1.6rem; margin:0; letter-spacing:.1em;">KEMET</h1>
          <p style="color:#8a7a5a; font-size:.78rem; margin:6px 0 0; letter-spacing:.2em; text-transform:uppercase;">Le média de l'Égypte ancienne</p>
        </div>
        <div style="padding:36px 32px;">
          <p style="font-size:1rem; margin-bottom:16px;">Bonjour,</p>
          <p>Votre demande d'ebook sur mesure a été examinée et <strong>acceptée</strong>.</p>
          <div style="border-left:3px solid #C9A84C; padding:14px 20px; margin:24px 0; background:#faf3e0;">
            <p style="font-size:.9rem; font-style:italic; color:#4a3f2a; margin:0 0 8px;">"${sujet.slice(0, 200)}${sujet.length > 200 ? '…' : ''}"</p>
            <strong style="font-size:1.3rem; color:#1B3A6B;">${parseFloat(price).toFixed(2)} €</strong>
          </div>
          <p>Pour procéder au paiement et lancer la rédaction, connectez-vous à votre espace personnel :</p>
          <div style="text-align:center; margin:28px 0;">
            <a href="${BASE_URL}/dashboard.html?commande=paid"
               style="display:inline-block; background:#1B3A6B; color:#fff; padding:14px 32px; text-decoration:none; font-family:Georgia,serif; letter-spacing:.08em;">
              Accéder à mon compte →
            </a>
          </div>
          <p style="font-size:.85rem; color:#6b5f4a;">Délai de livraison estimé : 3 à 5 semaines après réception du paiement.</p>
        </div>
        <div style="padding:20px 32px; border-top:1px solid #e8dfc8; text-align:center;">
          <p style="font-size:.75rem; color:#9a8a6a; margin:0;">Kemet — <a href="${BASE_URL}" style="color:#9a8a6a;">bdd-momo.vercel.app</a></p>
        </div>
      </div>
    `,
  };
}

function emailLivre({ email, sujet, delivery_url }) {
  const btnUrl = delivery_url || `${BASE_URL}/dashboard.html`;
  return {
    to:      email,
    subject: 'Votre ebook Kemet est prêt !',
    html: `
      <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; color:#1a1a1a;">
        <div style="background:#0d0d0d; padding:28px 32px; text-align:center;">
          <h1 style="color:#C9A84C; font-size:1.6rem; margin:0; letter-spacing:.1em;">KEMET</h1>
          <p style="color:#8a7a5a; font-size:.78rem; margin:6px 0 0; letter-spacing:.2em; text-transform:uppercase;">Le média de l'Égypte ancienne</p>
        </div>
        <div style="padding:36px 32px;">
          <p style="font-size:1rem; margin-bottom:16px;">Bonjour,</p>
          <p>Votre ebook sur mesure est <strong>prêt</strong>. Nous avons hâte que vous le lisiez.</p>
          <div style="border-left:3px solid #C9A84C; padding:14px 20px; margin:24px 0; background:#faf3e0;">
            <p style="font-size:.9rem; font-style:italic; color:#4a3f2a; margin:0;">"${sujet.slice(0, 200)}${sujet.length > 200 ? '…' : ''}"</p>
          </div>
          <div style="text-align:center; margin:28px 0;">
            <a href="${btnUrl}"
               style="display:inline-block; background:#1B3A6B; color:#fff; padding:14px 32px; text-decoration:none; font-family:Georgia,serif; letter-spacing:.08em;">
              Accéder à mon ebook →
            </a>
          </div>
          ${delivery_url ? `<p style="font-size:.82rem; color:#6b5f4a;">Lien direct : <a href="${delivery_url}" style="color:#1B3A6B;">${delivery_url}</a></p>` : ''}
          <p style="font-size:.85rem; color:#6b5f4a; margin-top:20px;">Merci de votre confiance. N'hésitez pas à commander un autre sujet sur mesure.</p>
        </div>
        <div style="padding:20px 32px; border-top:1px solid #e8dfc8; text-align:center;">
          <p style="font-size:.75rem; color:#9a8a6a; margin:0;">Kemet — <a href="${BASE_URL}" style="color:#9a8a6a;">bdd-momo.vercel.app</a></p>
        </div>
      </div>
    `,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callerEmail = req.headers['x-user-email'];
  const adminEmail  = (process.env.ADMIN_EMAIL || 'admin@kemet.fr').toLowerCase();

  if (!callerEmail || callerEmail.toLowerCase() !== adminEmail) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const { id, ...fields } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id requis' });

  const allowed = ['status', 'price', 'admin_note', 'delivery_url'];
  const patch   = {};
  for (const key of allowed) {
    if (key in fields) patch[key] = fields[key];
  }
  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Service indisponible' });
  }

  try {
    /* 1. Récupérer la commande avant update (pour l'email) */
    const getRes = await fetch(
      `${supabaseUrl}/rest/v1/ebook_requests?id=eq.${id}&select=email,sujet,status,price`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    const rows     = await getRes.json();
    const commande = rows?.[0];

    /* 2. Appliquer le PATCH */
    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/ebook_requests?id=eq.${id}`,
      {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer':        'return=minimal',
        },
        body: JSON.stringify(patch),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('Supabase update error:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    /* 3. Envoyer un email si statut significatif */
    let emailResult = { sent: false, reason: 'Pas de notification requise' };

    if (commande) {
      const newStatus = patch.status;
      const newPrice  = patch.price ?? commande.price;

      if (newStatus === 'accepted' && newPrice > 0) {
        emailResult = await sendEmail(emailAccepte({
          email: commande.email,
          sujet: commande.sujet,
          price: newPrice,
        }));
      } else if (newStatus === 'delivered') {
        emailResult = await sendEmail(emailLivre({
          email:        commande.email,
          sujet:        commande.sujet,
          delivery_url: patch.delivery_url || null,
        }));
      } else if (patch.price > 0 && commande.status === 'accepted') {
        /* Prix mis à jour sur une commande déjà acceptée → renvoyer */
        emailResult = await sendEmail(emailAccepte({
          email: commande.email,
          sujet: commande.sujet,
          price: patch.price,
        }));
      }
    }

    return res.status(200).json({ ok: true, email: emailResult });

  } catch (err) {
    console.error('admin-update-commande error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
