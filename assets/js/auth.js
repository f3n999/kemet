/* =========================================================
   KEMET — auth.js
   Auth localStorage (prototype — remplacer par Supabase en prod)
   ========================================================= */

const KEMET_USERS_KEY   = 'kemet_users_v1';
const KEMET_SESSION_KEY = 'kemet_session_v1';
const KEMET_EBOOKS_KEY  = 'kemet_ebooks_prices_v1';

/* --- Utilitaires --- */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(KEMET_USERS_KEY) || '[]'); }
  catch { return []; }
}
function saveUsers(u) { localStorage.setItem(KEMET_USERS_KEY, JSON.stringify(u)); }

/* --- Seed admin au premier démarrage --- */
async function seedAdmin() {
  const users = getUsers();
  if (users.find(u => u.email === 'admin@kemet.fr')) return;
  const hash = await sha256('Kemet2026!');
  users.push({
    id: 'admin-001',
    name: 'Administrateur',
    email: 'admin@kemet.fr',
    passwordHash: hash,
    role: 'admin',
    createdAt: new Date().toISOString(),
    purchases: []
  });
  saveUsers(users);
}

/* --- Inscription --- */
async function kemetRegister(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    throw new Error('Cet email est déjà utilisé.');
  if (password.length < 8)
    throw new Error('Le mot de passe doit faire au moins 8 caractères.');
  const hash = await sha256(password);
  const user = {
    id: 'u-' + Date.now(),
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    role: 'user',
    createdAt: new Date().toISOString(),
    purchases: []
  };
  users.push(user);
  saveUsers(users);
  _createSession(user);
  return user;
}

/* --- Connexion --- */
async function kemetLogin(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('Email ou mot de passe incorrect.');
  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error('Email ou mot de passe incorrect.');
  _createSession(user);
  return user;
}

/* --- Session --- */
function _createSession(user) {
  localStorage.setItem(KEMET_SESSION_KEY, JSON.stringify({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  }));
}

function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEMET_SESSION_KEY));
    if (!s) return null;
    if (Date.now() > s.expiresAt) { kemetLogout(); return null; }
    return s;
  } catch { return null; }
}

function kemetLogout() {
  localStorage.removeItem(KEMET_SESSION_KEY);
  window.location.href = window.location.pathname.includes('/figures/') ? '../index.html' : 'index.html';
}

/* --- Guards --- */
function requireAuth(redirect) {
  if (!getSession()) { window.location.href = redirect || 'login.html'; return false; }
  return true;
}
function requireAdmin(redirect) {
  const s = getSession();
  if (!s || s.role !== 'admin') { window.location.href = redirect || 'index.html'; return false; }
  return true;
}

/* --- Accès ebooks --- */
function hasEbookAccess(ebookId) {
  const s = getSession();
  if (!s) return false;
  if (s.role === 'admin') return true;
  const user = getUsers().find(u => u.id === s.userId);
  return user ? user.purchases.includes(ebookId) : false;
}

function grantEbookAccess(userId, ebookId) {
  const users = getUsers();
  const u = users.find(u => u.id === userId);
  if (!u || u.purchases.includes(ebookId)) return;
  u.purchases.push(ebookId);
  saveUsers(users);
}

function revokeEbookAccess(userId, ebookId) {
  const users = getUsers();
  const u = users.find(u => u.id === userId);
  if (!u) return;
  u.purchases = u.purchases.filter(id => id !== ebookId);
  saveUsers(users);
}

/* --- Prix ebooks (admin peut modifier) --- */
const DEFAULT_PRICES = {
  'akhenaton-pharaon-heretique': 0,
  'pyramides-science': 7.99,
  'nefertiti-enquete': 6.99,
  'hatchepsout-regne-efface': 7.99,
  'ramses-propagande': 8.99,
  'momification-manuel': 6.99,
  'toutankhamon-tresor': 5.99,
  'hieroglyphes-initiation': 0,
  'voyager-egypte-guide': 9.99,
  'cleopatre-derniere-pharaone': 7.99
};

function getEbookPrices() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEMET_EBOOKS_KEY) || '{}');
    return { ...DEFAULT_PRICES, ...saved };
  } catch { return { ...DEFAULT_PRICES }; }
}

function setEbookPrice(slug, price) {
  const prices = getEbookPrices();
  prices[slug] = parseFloat(price);
  localStorage.setItem(KEMET_EBOOKS_KEY, JSON.stringify(prices));
}

/* --- Mise à jour nav --- */
function updateNavAuth(prefix) {
  const p = prefix || '';
  const item = document.getElementById('nav-auth-item');
  if (!item) return;
  const s = getSession();
  if (s) {
    const first = s.name.split(' ')[0];
    const adminLink = s.role === 'admin' ? `<a href="${p}admin.html" style="font-size:.68rem;letter-spacing:.15em;font-family:var(--serif-display);text-transform:uppercase;color:var(--gold);padding:6px 0;">Admin</a>` : '';
    item.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        ${adminLink}
        <a href="${p}dashboard.html" class="nav-cta">${first}</a>
      </span>`;
  } else {
    item.innerHTML = `<a href="${p}login.html" class="nav-cta">Connexion</a>`;
  }
}

/* Init */
seedAdmin();
