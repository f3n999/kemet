/* =========================================================
   KEMET — auth.js  v2
   Mode Supabase si kemet-config.js est renseigné,
   sinon mode localStorage (prototype).
   ========================================================= */

/* ──────────────────────────────────────────────
   SECTION 1 — UTILITAIRES COMMUNS
   ────────────────────────────────────────────── */

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const KEMET_USERS_KEY   = 'kemet_users_v1';
const KEMET_SESSION_KEY = 'kemet_session_v1';
const KEMET_EBOOKS_KEY  = 'kemet_ebooks_prices_v1';

const DEFAULT_PRICES = {
  'akhenaton-pharaon-heretique':  0,
  'pyramides-science':            7.99,
  'nefertiti-enquete':            6.99,
  'hatchepsout-regne-efface':     7.99,
  'ramses-propagande':            8.99,
  'momification-manuel':          6.99,
  'toutankhamon-tresor':          5.99,
  'hieroglyphes-initiation':      0,
  'voyager-egypte-guide':         9.99,
  'cleopatre-derniere-pharaone':  7.99,
};

/* ──────────────────────────────────────────────
   SECTION 2 — MODE SUPABASE
   ────────────────────────────────────────────── */

let _sb = null;

function _initSupabase() {
  if (_sb) return _sb;
  const { createClient } = supabase;
  _sb = createClient(window.KEMET_CONFIG.supabaseUrl, window.KEMET_CONFIG.supabaseKey);
  return _sb;
}

/* Inscription Supabase */
async function _sbRegister(name, email, password) {
  const sb = _initSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw new Error(error.message);
  if (data.user && !data.session) {
    throw new Error('Vérifiez votre email pour confirmer votre inscription.');
  }
  return _sbBuildSession(data.user, name, 'user');
}

/* Connexion Supabase */
async function _sbLogin(email, password) {
  const sb = _initSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Email ou mot de passe incorrect.');
  const profile = await _sbGetProfile(data.user.id);
  return _sbBuildSession(data.user, profile?.name || data.user.email, profile?.role || 'user');
}

/* Récupérer le profil */
async function _sbGetProfile(userId) {
  const sb = _initSupabase();
  const { data } = await sb.from('profiles').select('name, role').eq('id', userId).single();
  return data;
}

/* Construire l'objet session local depuis Supabase */
function _sbBuildSession(user, name, role) {
  const session = { userId: user.id, email: user.email, name, role, backend: 'supabase' };
  localStorage.setItem(KEMET_SESSION_KEY, JSON.stringify(session));
  return session;
}

/* Déconnexion Supabase */
async function _sbLogout() {
  const sb = _initSupabase();
  await sb.auth.signOut();
  localStorage.removeItem(KEMET_SESSION_KEY);
}

/* Session Supabase — vérifier que le token est toujours valide */
async function _sbRefreshSession() {
  const sb = _initSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    localStorage.removeItem(KEMET_SESSION_KEY);
    return null;
  }
  const profile = await _sbGetProfile(session.user.id);
  return _sbBuildSession(session.user, profile?.name || session.user.email, profile?.role || 'user');
}

/* Accès ebook Supabase */
async function _sbHasAccess(ebookSlug) {
  const s = getSession();
  if (!s) return false;
  if (s.role === 'admin') return true;
  const sb = _initSupabase();
  const { data } = await sb.from('user_purchases')
    .select('id')
    .eq('user_id', s.userId)
    .eq('ebook_slug', ebookSlug)
    .maybeSingle();
  return !!data;
}

/* Prix ebooks Supabase */
async function _sbGetPrices() {
  const sb = _initSupabase();
  const { data } = await sb.from('ebook_prices').select('slug, price');
  if (!data) return { ...DEFAULT_PRICES };
  const result = { ...DEFAULT_PRICES };
  data.forEach(row => { result[row.slug] = parseFloat(row.price); });
  return result;
}

async function _sbSetPrice(slug, price) {
  const sb = _initSupabase();
  await sb.from('ebook_prices')
    .upsert({ slug, price, updated_at: new Date().toISOString() });
}

/* Tous les utilisateurs (admin) */
async function _sbGetUsers() {
  const sb = _initSupabase();
  const { data: profiles } = await sb.from('profiles').select('*');
  const { data: purchases } = await sb.from('user_purchases').select('user_id, ebook_slug');
  if (!profiles) return [];
  const purchaseMap = {};
  (purchases || []).forEach(p => {
    if (!purchaseMap[p.user_id]) purchaseMap[p.user_id] = [];
    purchaseMap[p.user_id].push(p.ebook_slug);
  });
  return profiles.map(p => ({
    id: p.id,
    name: p.name,
    email: '(voir Supabase)',
    role: p.role,
    createdAt: p.created_at,
    purchases: purchaseMap[p.id] || []
  }));
}

async function _sbGrantAccess(userId, ebookSlug) {
  const sb = _initSupabase();
  await sb.from('user_purchases')
    .upsert({ user_id: userId, ebook_slug: ebookSlug });
}

async function _sbRevokeAccess(userId, ebookSlug) {
  const sb = _initSupabase();
  await sb.from('user_purchases')
    .delete()
    .eq('user_id', userId)
    .eq('ebook_slug', ebookSlug);
}

/* ──────────────────────────────────────────────
   SECTION 3 — MODE LOCALSTORAGE (prototype)
   ────────────────────────────────────────────── */

function _lsGetUsers() {
  try { return JSON.parse(localStorage.getItem(KEMET_USERS_KEY) || '[]'); }
  catch { return []; }
}
function _lsSaveUsers(u) { localStorage.setItem(KEMET_USERS_KEY, JSON.stringify(u)); }

async function _lsSeedAdmin() {
  const users = _lsGetUsers();
  if (users.find(u => u.email === 'admin@kemet.fr')) return;
  const hash = await sha256('Kemet2026!');
  users.push({ id:'admin-001', name:'Administrateur', email:'admin@kemet.fr',
    passwordHash:hash, role:'admin', createdAt:new Date().toISOString(), purchases:[] });
  _lsSaveUsers(users);
}

async function _lsRegister(name, email, password) {
  const users = _lsGetUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    throw new Error('Cet email est déjà utilisé.');
  if (password.length < 8)
    throw new Error('Le mot de passe doit faire au moins 8 caractères.');
  const hash = await sha256(password);
  const user = { id:'u-'+Date.now(), name, email:email.toLowerCase(), passwordHash:hash,
    role:'user', createdAt:new Date().toISOString(), purchases:[] };
  users.push(user);
  _lsSaveUsers(users);
  return _lsCreateSession(user);
}

async function _lsLogin(email, password) {
  const users = _lsGetUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('Email ou mot de passe incorrect.');
  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error('Email ou mot de passe incorrect.');
  return _lsCreateSession(user);
}

function _lsCreateSession(user) {
  const s = { userId:user.id, email:user.email, name:user.name, role:user.role,
    expiresAt:Date.now() + 7*24*60*60*1000, backend:'localStorage' };
  localStorage.setItem(KEMET_SESSION_KEY, JSON.stringify(s));
  return s;
}

function _lsGetSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEMET_SESSION_KEY));
    if (!s) return null;
    if (s.backend === 'supabase') return s;
    if (Date.now() > s.expiresAt) { localStorage.removeItem(KEMET_SESSION_KEY); return null; }
    return s;
  } catch { return null; }
}

/* ──────────────────────────────────────────────
   SECTION 4 — API PUBLIQUE UNIFIÉE
   Ces fonctions sont identiques en mode Supabase et localStorage.
   Tous les HTML appellent uniquement ces fonctions.
   ────────────────────────────────────────────── */

async function kemetRegister(name, email, password) {
  if (window.KEMET_USE_SUPABASE) return _sbRegister(name, email, password);
  return _lsRegister(name, email, password);
}

async function kemetLogin(email, password) {
  if (window.KEMET_USE_SUPABASE) return _sbLogin(email, password);
  return _lsLogin(email, password);
}

async function kemetLogout() {
  if (window.KEMET_USE_SUPABASE) await _sbLogout();
  else localStorage.removeItem(KEMET_SESSION_KEY);
  const isInFigures = window.location.pathname.includes('/figures/');
  window.location.href = isInFigures ? '../index.html' : 'index.html';
}

function getSession() {
  return _lsGetSession();
}

async function refreshSession() {
  if (window.KEMET_USE_SUPABASE) return _sbRefreshSession();
  return _lsGetSession();
}

function requireAuth(redirect) {
  if (!getSession()) { window.location.href = redirect || 'login.html'; return false; }
  return true;
}

function requireAdmin(redirect) {
  const s = getSession();
  if (!s || s.role !== 'admin') { window.location.href = redirect || 'index.html'; return false; }
  return true;
}

/* Prix */
function getEbookPrices() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEMET_EBOOKS_KEY) || '{}');
    return { ...DEFAULT_PRICES, ...saved };
  } catch { return { ...DEFAULT_PRICES }; }
}

async function getEbookPricesAsync() {
  if (window.KEMET_USE_SUPABASE) return _sbGetPrices();
  return getEbookPrices();
}

function setEbookPrice(slug, price) {
  if (window.KEMET_USE_SUPABASE) { _sbSetPrice(slug, price); return; }
  const prices = getEbookPrices();
  prices[slug] = parseFloat(price);
  localStorage.setItem(KEMET_EBOOKS_KEY, JSON.stringify(prices));
}

/* Accès ebooks */
function hasEbookAccess(ebookSlug) {
  const s = getSession();
  if (!s) return false;
  if (s.role === 'admin') return true;
  if (s.backend === 'supabase') return false; // async requis — utiliser hasEbookAccessAsync()
  const user = _lsGetUsers().find(u => u.id === s.userId);
  return user ? user.purchases.includes(ebookSlug) : false;
}

async function hasEbookAccessAsync(ebookSlug) {
  if (window.KEMET_USE_SUPABASE) return _sbHasAccess(ebookSlug);
  return hasEbookAccess(ebookSlug);
}

/* Gestion accès (admin) */
function getUsers() {
  if (window.KEMET_USE_SUPABASE) return _sbGetUsers(); // retourne une Promise
  return _lsGetUsers();
}

function grantEbookAccess(userId, ebookSlug) {
  if (window.KEMET_USE_SUPABASE) return _sbGrantAccess(userId, ebookSlug);
  const users = _lsGetUsers();
  const u = users.find(u => u.id === userId);
  if (!u || u.purchases.includes(ebookSlug)) return;
  u.purchases.push(ebookSlug);
  _lsSaveUsers(users);
}

function revokeEbookAccess(userId, ebookSlug) {
  if (window.KEMET_USE_SUPABASE) return _sbRevokeAccess(userId, ebookSlug);
  const users = _lsGetUsers();
  const u = users.find(u => u.id === userId);
  if (!u) return;
  u.purchases = u.purchases.filter(id => id !== ebookSlug);
  _lsSaveUsers(users);
}

/* Nav auth dynamique */
function updateNavAuth(prefix) {
  const p   = prefix || '';
  const item = document.getElementById('nav-auth-item');
  if (!item) return;
  const s = getSession();
  if (s) {
    const first     = s.name.split(' ')[0];
    const adminLink = s.role === 'admin'
      ? `<a href="${p}admin.html" style="font-size:.68rem;letter-spacing:.15em;font-family:var(--serif-display);text-transform:uppercase;color:var(--gold);padding:6px 0;">Admin</a>`
      : '';
    item.innerHTML = `<span style="display:flex;align-items:center;gap:10px;">
      ${adminLink}
      <a href="${p}dashboard.html" class="nav-cta">${first}</a>
    </span>`;
  } else {
    item.innerHTML = `<a href="${p}login.html" class="nav-cta">Connexion</a>`;
  }
}

/* ──────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────── */

(function init() {
  if (typeof window.KEMET_USE_SUPABASE === 'undefined') {
    window.KEMET_USE_SUPABASE = false;
    window.KEMET_CONFIG = window.KEMET_CONFIG || {};
  }
  if (!window.KEMET_USE_SUPABASE) {
    _lsSeedAdmin();
  }
})();
