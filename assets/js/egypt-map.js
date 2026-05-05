/* =========================================================
   KEMET — egypt-map.js
   Carte interactive d'Égypte (React 18 + htm via CDN)
   Pas de build : htm bind sur React.createElement.
   ========================================================= */

(function () {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined' || typeof htm === 'undefined') {
    console.warn('[egypt-map] React / ReactDOM / htm non chargé — abandon.');
    return;
  }

  const { useState } = React;
  const html = htm.bind(React.createElement);

  /* ────────────────────────────────────────────────
     DONNÉES
     ──────────────────────────────────────────────── */
  const CITIES = [
    {
      id: 'alexandrie',
      name: 'Alexandrie',
      ancient: 'Rakôtis (avant Alexandre)',
      x: 200, y: 70,
      era: 'Période ptolémaïque · 331 av. J.-C.',
      description: "Fondée par Alexandre le Grand en 331 av. J.-C., capitale ptolémaïque jusqu'à la conquête romaine. Cosmopolite, helléniste, point de rencontre des cultures de la Méditerranée.",
      monuments: [
        { name: "Phare d'Alexandrie", desc: "L'une des Sept Merveilles du monde antique, environ 100m de haut. Détruit par les séismes en 1303." },
        { name: "Bibliothèque d'Alexandrie", desc: "Centre intellectuel du monde antique. Jusqu'à 500 000 rouleaux. Détruite progressivement entre le IIIᵉ et le VIIᵉ siècle." },
        { name: "Catacombes de Kom el-Shoqafa", desc: "Tombe romaine taillée dans le roc, IIᵉ siècle, mêlant iconographies égyptienne, grecque et romaine." }
      ]
    },
    {
      id: 'caire',
      name: 'Le Caire',
      ancient: "Babylone d'Égypte / Fustat",
      x: 268, y: 138,
      era: 'Période islamique · fondé en 969',
      description: "Fondé par les Fatimides en 969 sur les ruines de la forteresse romaine de Babylone. Successeur de Memphis, voisin direct du plateau de Gizeh. Cœur politique et culturel de l'Égypte moderne.",
      monuments: [
        { name: "Mosquée d'Ibn Touloun", desc: "Plus ancienne mosquée du Caire encore intacte, 879. Architecture abbasside et minaret en spirale." },
        { name: "Citadelle de Saladin", desc: "Forteresse médiévale dominant la ville depuis le XIIᵉ siècle. Domine le Caire depuis le mont Mokattam." },
        { name: "Musée égyptien de Tahrir", desc: "Plus de 170 000 pièces — dont l'intégralité du trésor de Toutânkhamon." }
      ]
    },
    {
      id: 'gizeh',
      name: 'Gizeh',
      ancient: 'Plateau de Giza',
      x: 248, y: 142,
      isPyramid: true,
      era: 'Ancien Empire · IVᵉ dynastie · ~2560 av. J.-C.',
      description: "Le complexe funéraire de la IVᵉ dynastie. Chantier monumental qui a mobilisé l'État pharaonique pendant trois générations. Aligné sur les points cardinaux avec une précision astronomique.",
      monuments: [
        { name: "Grande pyramide de Khéops", desc: "146,6m à l'origine, 138m aujourd'hui. La seule des Sept Merveilles encore debout. ~2,3 millions de blocs de calcaire." },
        { name: "Pyramide de Khéphren", desc: "143m. Conserve son revêtement de calcaire au sommet. Visuellement plus haute que Khéops car bâtie sur un socle plus élevé." },
        { name: "Sphinx de Gizeh", desc: "Statue colossale taillée dans le roc, 73m de long, 20m de haut. Sans doute à l'effigie de Khéphren — débat ouvert." }
      ]
    },
    {
      id: 'saqqara',
      name: 'Saqqara',
      ancient: 'Nécropole de Memphis',
      x: 254, y: 168,
      isPyramid: true,
      era: 'IIIᵉ dynastie · ~2670 av. J.-C.',
      description: "La nécropole millénaire de la capitale Memphis. Saqqara raconte 3000 ans d'histoire funéraire — depuis la première pyramide d'Imhotep jusqu'aux tombes ptolémaïques et coptes.",
      monuments: [
        { name: "Pyramide à degrés de Djoser", desc: "Première pyramide d'Égypte, 60m. Conçue par Imhotep — premier architecte connu de l'histoire." },
        { name: "Sérapéum", desc: "Catacombes des taureaux Apis, sépultures sacrées avec sarcophages de granit de 70 tonnes." },
        { name: "Mastabas des Anciens Royaumes", desc: "Tombes de hauts fonctionnaires aux reliefs peints — scènes de vie quotidienne d'une rare précision." }
      ]
    },
    {
      id: 'abydos',
      name: 'Abydos',
      ancient: 'Abdjou',
      x: 290, y: 340,
      era: 'Toutes périodes · centre du culte d\'Osiris',
      description: "Le sanctuaire d'Osiris, dieu des morts. Pèlerinage obligatoire pour tout Égyptien lettré. Lieu de la légende de la résurrection — où les fragments d'Osiris auraient été rassemblés.",
      monuments: [
        { name: "Temple de Séthi Iᵉʳ", desc: "Reliefs polychromes parmi les mieux conservés d'Égypte. Plafond astronomique d'une finesse exceptionnelle." },
        { name: "Liste royale d'Abydos", desc: "76 cartouches des pharaons légitimes selon Séthi Iᵉʳ. Référence chronologique majeure (et politique : exclut les hérétiques)." },
        { name: "Osireion", desc: "Cénotaphe symbolique d'Osiris derrière le temple de Séthi. Architecture mégalithique débattue." }
      ]
    },
    {
      id: 'louxor',
      name: 'Louxor',
      ancient: 'Thèbes / Ouaset',
      x: 300, y: 470,
      era: 'Nouvel Empire · XVIIIᵉ-XXᵉ dynastie',
      description: "Capitale du Nouvel Empire, cœur religieux de l'Égypte ancienne. Thèbes a régné sur 1500 ans d'histoire pharaonique — la ville d'Amon, la rive des morts, la rive des vivants.",
      monuments: [
        { name: "Karnak", desc: "Plus grand complexe religieux jamais construit, 30 hectares. Salle hypostyle de 134 colonnes — certaines de 23m de haut." },
        { name: "Vallée des Rois", desc: "63 tombes royales découvertes — Toutânkhamon, Ramsès II, Séthi Iᵉʳ, Hatchepsout." },
        { name: "Temple de Louxor", desc: "Relié à Karnak par l'allée des sphinx (3km). Restauration achevée en 2021 après 70 ans de fouilles." }
      ]
    },
    {
      id: 'assouan',
      name: 'Assouan',
      ancient: 'Souenet / Yebou',
      x: 318, y: 590,
      era: 'Toutes périodes · frontière sud',
      description: "Frontière sud de l'Égypte historique. Premier cataracte du Nil — verrou commercial et militaire. Porte vers la Nubie. Carrière du granite rose des obélisques pharaoniques.",
      monuments: [
        { name: "Temple de Philae", desc: "Sanctuaire d'Isis. Démonté pierre par pierre dans les années 1970 et remonté sur l'île d'Aguilkia pour échapper au lac Nasser." },
        { name: "Obélisque inachevé", desc: "Bloc de granite de 1200 tonnes encore dans la carrière. Aurait été le plus grand obélisque jamais taillé — 42m." },
        { name: "Île d'Éléphantine", desc: "Poste-frontière depuis l'Ancien Empire. Temple de Khnoum, dieu créateur des hommes au tour de potier." }
      ]
    },
    {
      id: 'abu-simbel',
      name: 'Abou Simbel',
      ancient: 'Temple de Ramsès II',
      x: 305, y: 690,
      era: 'Nouvel Empire · ~1264 av. J.-C.',
      description: "Le manifeste politique de Ramsès II en Nubie. Aligné astronomiquement : le soleil pénètre le sanctuaire et illumine la statue du pharaon deux fois par an, le 22 février et le 22 octobre.",
      monuments: [
        { name: "Grand temple de Ramsès II", desc: "Quatre colosses assis de 20m de haut taillés dans la falaise. Façade orientée vers l'est, vers le soleil levant." },
        { name: "Petit temple de Néfertari", desc: "Dédié à la grande épouse royale. Six colosses de 10m, dont quatre représentent Ramsès et deux Néfertari — hommage exceptionnel." },
        { name: "Sauvetage de l'UNESCO (1968)", desc: "Démonté en 1036 blocs et remonté 65m plus haut pour échapper au lac Nasser. Premier grand chantier de sauvetage patrimonial international." }
      ]
    }
  ];

  /* ────────────────────────────────────────────────
     CHEMINS SVG (paths)
     ──────────────────────────────────────────────── */

  // Égypte continentale (sans Sinaï)
  const EGYPT_LAND = "M 130,75 L 200,72 C 215,82 222,98 232,115 C 248,92 264,90 282,112 C 296,98 308,84 330,72 L 380,75 L 376,135 C 368,200 360,310 350,500 L 342,720 L 200,720 L 168,690 L 148,520 L 134,330 Z";

  // Sinaï (séparé par le golfe de Suez)
  const SINAI_LAND = "M 392,82 L 422,52 L 466,72 L 472,108 L 442,168 L 408,140 Z";

  // Désert (zones sablonneuses au-delà de la vallée du Nil)
  const DESERT_WEST = "M 134,330 L 148,520 L 168,690 L 180,690 L 175,520 L 165,330 Z";
  const DESERT_EAST = "M 376,135 C 368,200 360,310 350,500 L 342,720 L 332,720 L 340,500 L 350,310 L 358,200 Z";

  // Nil (du sud au nord)
  const NILE_PATH = "M 305,720 Q 308,640 305,560 Q 300,460 295,380 Q 290,290 282,200 Q 274,158 268,138";
  // Delta (branches qui s'ouvrent en éventail vers la Méditerranée)
  const NILE_DELTA = "M 268,138 L 232,80 M 268,138 L 252,78 M 268,138 L 268,76 M 268,138 L 290,76 M 268,138 L 312,80";

  /* ────────────────────────────────────────────────
     SOUS-COMPOSANTS
     ──────────────────────────────────────────────── */

  function Pyramid({ x, y, size }) {
    const s = size || 9;
    return html`
      <g class="pyramid-group" transform=${`translate(${x},${y})`}>
        <polygon class="pyramid-shadow" points=${`0,${-s} ${s*0.95},${s*0.7} 0,${s*0.7}`} />
        <polygon class="pyramid-face" points=${`0,${-s} ${-s*0.95},${s*0.7} 0,${s*0.7}`} />
      </g>
    `;
  }

  function CityMarker({ city, selected, onClick }) {
    const cls = selected ? 'city-marker is-selected' : 'city-marker';
    // Position du label : à droite par défaut, à gauche pour les villes proches du bord est
    const labelOnLeft = city.x > 290;
    const labelX = labelOnLeft ? -10 : 10;
    const labelAnchor = labelOnLeft ? 'end' : 'start';
    return html`
      <g class=${cls} onClick=${onClick} transform=${`translate(${city.x},${city.y})`}>
        <circle class="city-pulse" r="6" cx="0" cy="0" />
        <circle class="city-dot" r="5" cx="0" cy="0" />
        <text class="city-label" x=${labelX} y="4" text-anchor=${labelAnchor}>${city.name}</text>
      </g>
    `;
  }

  function MapSVG({ selected, onSelect }) {
    return html`
      <svg class="map-svg" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte interactive de l'Égypte">
        <defs>
          <pattern id="kemet-sand-pattern" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <rect width="14" height="14" fill="#d4b896" opacity="0.85" />
            <circle cx="3" cy="4" r="0.6" fill="#8a7050" opacity="0.55" />
            <circle cx="9" cy="9" r="0.6" fill="#8a7050" opacity="0.55" />
            <circle cx="11" cy="2" r="0.4" fill="#a08560" opacity="0.45" />
            <circle cx="2" cy="11" r="0.5" fill="#a08560" opacity="0.45" />
            <circle cx="6" cy="6.5" r="0.3" fill="#6e553a" opacity="0.4" />
          </pattern>
        </defs>

        <!-- Méditerranée -->
        <rect class="sea" x="0" y="0" width="500" height="60" />
        <text class="sea-label" x="250" y="28" text-anchor="middle">Méditerranée</text>

        <!-- Mer Rouge / Golfe de Suez (à droite) -->
        <path class="sea" d="M 380,60 L 500,60 L 500,800 L 320,800 Q 340,500 376,135 Q 380,90 380,60 Z" />
        <text class="sea-label" x="455" y="430" text-anchor="middle" transform="rotate(90 455 430)">Mer Rouge</text>

        <!-- Bordure ouest (Libye) -->
        <rect class="sea" x="0" y="60" width="130" height="740" fill="rgba(20,17,13,0.6)" />

        <!-- Égypte continentale -->
        <path class="egypt-land" d=${EGYPT_LAND} />

        <!-- Sinaï -->
        <path class="egypt-land" d=${SINAI_LAND} />

        <!-- Désert (overlay subtil) -->
        <path class="desert-shade" d=${DESERT_WEST} />
        <path class="desert-shade" d=${DESERT_EAST} />

        <!-- Nil — halo / glow -->
        <path class="nile-glow" d=${NILE_PATH} />
        <path class="nile-glow" d=${NILE_DELTA} />

        <!-- Nil — base -->
        <path class="nile-base" d=${NILE_PATH} />
        <path class="nile-base" d=${NILE_DELTA} />

        <!-- Nil — flux animé -->
        <path class="nile-flow" d=${NILE_PATH} />
        <path class="nile-flow" d=${NILE_DELTA} />

        <!-- Pyramides (Gizeh + Saqqara + Dahshour) -->
        <${Pyramid} x=${238} y=${145} size=${10} />
        <${Pyramid} x=${228} y=${152} size=${7} />
        <${Pyramid} x=${248} y=${172} size=${8} />
        <${Pyramid} x=${252} y=${188} size=${7} />

        <!-- Villes -->
        ${CITIES.map(c => html`
          <${CityMarker}
            key=${c.id}
            city=${c}
            selected=${selected && selected.id === c.id}
            onClick=${() => onSelect(c)}
          />
        `)}

        <!-- Compass / rose des vents -->
        <g transform="translate(60,750)">
          <circle class="compass" r="22" cx="0" cy="0" />
          <line class="compass" x1="0" y1="-22" x2="0" y2="22" />
          <line class="compass" x1="-22" y1="0" x2="22" y2="0" />
          <text class="compass-text" x="0" y="-28" text-anchor="middle">N</text>
          <text class="compass-text" x="0" y="36" text-anchor="middle">S</text>
          <text class="compass-text" x="-30" y="3" text-anchor="end">O</text>
          <text class="compass-text" x="30" y="3" text-anchor="start">E</text>
        </g>
      </svg>
    `;
  }

  function CityPanel({ city }) {
    if (!city) {
      return html`
        <aside class="city-panel city-panel-empty">
          <div>
            <div class="glyph">𓂀</div>
            <p>Cliquez sur une ville pour découvrir ses monuments, son époque et son rôle dans l'histoire pharaonique.</p>
          </div>
        </aside>
      `;
    }
    return html`
      <aside class="city-panel">
        <h3>${city.name}</h3>
        <div class="city-ancient">Antique : ${city.ancient}</div>
        <span class="city-era">${city.era}</span>
        <p class="city-description">${city.description}</p>
        <ul class="monument-list">
          ${city.monuments.map((m, i) => html`
            <li key=${i}>
              <div class="monument-name">${m.name}</div>
              <div class="monument-desc">${m.desc}</div>
            </li>
          `)}
        </ul>
      </aside>
    `;
  }

  function EgyptMapApp() {
    const [selected, setSelected] = useState(null);
    return html`
      <div class="map-grid">
        <div class="map-svg-wrap">
          <${MapSVG} selected=${selected} onSelect=${setSelected} />
        </div>
        <${CityPanel} city=${selected} />
      </div>
    `;
  }

  /* ────────────────────────────────────────────────
     MOUNT
     ──────────────────────────────────────────────── */
  const mountPoint = document.getElementById('egypt-map-root');
  if (mountPoint) {
    ReactDOM.createRoot(mountPoint).render(html`<${EgyptMapApp} />`);
  }
})();
