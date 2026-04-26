/* =========================================================
   KEMET — Configuration backend
   Remplace les valeurs ci-dessous avec tes credentials Supabase
   (Settings → API dans ton tableau de bord Supabase)
   ========================================================= */

window.KEMET_CONFIG = {
  supabaseUrl:  'REMPLACE_PAR_TON_PROJECT_URL',   // ex: https://xxxx.supabase.co
  supabaseKey:  'REMPLACE_PAR_TON_ANON_KEY',       // anon public key
};

/* Détection : si les valeurs sont remplies, le site utilisera Supabase.
   Sinon, il reste en mode localStorage (prototype). */
window.KEMET_USE_SUPABASE = (
  window.KEMET_CONFIG.supabaseUrl  !== 'REMPLACE_PAR_TON_PROJECT_URL' &&
  window.KEMET_CONFIG.supabaseKey  !== 'REMPLACE_PAR_TON_ANON_KEY'
);
