/* =========================================================
   KEMET — main.js
   Navigation, frise chronologique, recherche, formulaire
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initActiveLink();
  initFadeIn();
  initTimeline();
  initLeadForm();
});

/* ---------- NAV ---------- */
function initNav(){
  const toggle = document.querySelector('.menu-toggle');
  const links  = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', links.classList.contains('is-open'));
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('is-open'))
  );
}

function initActiveLink(){
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === here) a.classList.add('is-active');
  });
}

/* ---------- FADE-IN AU SCROLL ---------- */
function initFadeIn(){
  if(!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('fade-up');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

/* ---------- TIMELINE / CHRONOLOGIE ---------- */
let TL_DATA = null;
let TL_FILTER = { period: 'all', q: '' };

async function initTimeline(){
  const root = document.getElementById('timeline');
  if(!root) return;
  try{
    const res = await fetch('data/timeline.json');
    if(!res.ok) throw new Error('JSON HTTP ' + res.status);
    TL_DATA = await res.json();
  }catch(err){
    root.innerHTML = '<p class="timeline-empty">Impossible de charger la chronologie. ' +
                     'Si tu ouvres le fichier directement (file://), lance plutôt un petit serveur local : <code>python3 -m http.server</code></p>';
    console.error(err);
    return;
  }
  buildPeriodChips();
  renderTimeline();

  const search = document.getElementById('tl-search');
  if(search){
    search.addEventListener('input', (e) => {
      TL_FILTER.q = e.target.value.trim().toLowerCase();
      renderTimeline();
    });
  }
}

function buildPeriodChips(){
  const wrap = document.getElementById('tl-chips');
  if(!wrap || !TL_DATA) return;
  const all = ['<button class="chip is-active" data-period="all">Toutes les périodes</button>'];
  TL_DATA.periods.forEach(p => {
    all.push(`<button class="chip" data-period="${p.id}">${p.label}</button>`);
  });
  wrap.innerHTML = all.join('');
  wrap.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      TL_FILTER.period = btn.dataset.period;
      renderTimeline();
    });
  });
}

function renderTimeline(){
  const root = document.getElementById('timeline');
  if(!root || !TL_DATA) return;
  const events = TL_DATA.events
    .slice()
    .sort((a,b) => a.year - b.year)
    .filter(ev => {
      if(TL_FILTER.period !== 'all' && ev.period !== TL_FILTER.period) return false;
      if(TL_FILTER.q){
        const blob = (ev.title + ' ' + ev.description + ' ' + ev.displayDate).toLowerCase();
        if(!blob.includes(TL_FILTER.q)) return false;
      }
      return true;
    });

  if(!events.length){
    root.innerHTML = '<p class="timeline-empty">Aucun événement ne correspond à ta recherche.</p>';
    return;
  }

  const periodLabel = id => {
    const p = TL_DATA.periods.find(x => x.id === id);
    return p ? p.label : id;
  };

  root.innerHTML = events.map(ev => `
    <article class="tl-event">
      <div class="tl-card">
        <span class="tl-date">${ev.displayDate}</span>
        <h3 class="tl-title">${ev.title}</h3>
        <p class="tl-desc">${ev.description}</p>
        <span class="tl-period">${periodLabel(ev.period)}</span>
      </div>
    </article>
  `).join('');
}

/* ---------- FORMULAIRE LEAD VOYAGE ---------- */
function initLeadForm(){
  const form = document.getElementById('lead-form');
  if(!form) return;
  const status = document.getElementById('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // Stockage local de secours en attendant un backend (Formspree, Netlify Forms, etc.)
    try{
      const all = JSON.parse(localStorage.getItem('kemet_leads') || '[]');
      all.push({ ...data, ts: new Date().toISOString() });
      localStorage.setItem('kemet_leads', JSON.stringify(all));
    }catch(_){}
    status.classList.add('is-visible');
    status.innerHTML = '<strong>Merci ' + (data.prenom || '') + '.</strong> ' +
      'Ta demande a bien été enregistrée. Tu recevras une proposition personnalisée sous 48 h. ' +
      '<br><em style="font-size:.85rem;">(En attendant la connexion à un vrai backend, les demandes sont stockées localement dans ton navigateur.)</em>';
    form.reset();
  });
}
