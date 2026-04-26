/* =========================================================
   KEMET — Configuration backend
   Remplace les valeurs ci-dessous avec tes credentials Supabase
   (Settings → API dans ton tableau de bord Supabase)
   ========================================================= */

window.KEMET_CONFIG = {
  supabaseUrl:  'https://ndfsanswsxxudmxolytx.supabase.co',
  supabaseKey:  'sb_publishable_T5TB8oaZu1tses5Cmg_HJQ_2NX6_KXO',
};

/* Détection : si les valeurs sont remplies, le site utilisera Supabase.
   Sinon, il reste en mode localStorage (prototype). */
window.KEMET_USE_SUPABASE = (
  window.KEMET_CONFIG.supabaseUrl  !== 'REMPLACE_PAR_TON_PROJECT_URL' &&
  window.KEMET_CONFIG.supabaseKey  !== 'REMPLACE_PAR_TON_ANON_KEY'
);
