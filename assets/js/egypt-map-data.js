/* =========================================================
   KEMET — egypt-map-data.js
   Données des villes égyptiennes pour la carte 3D.
   Coordonnées 3D : x = Est/Ouest, z = Sud/Nord
   Convention : nord = -z, sud = +z
   ========================================================= */

export const CITIES = [
  {
    id: 'alexandrie',
    name: 'Alexandrie',
    ancient: 'Rakôtis',
    pos: [-2, 0, -98],
    era: 'Période ptolémaïque · 331 av. J.-C.',
    description: "Fondée par Alexandre le Grand en 331 av. J.-C., capitale ptolémaïque jusqu'à la conquête romaine. Cosmopolite, helléniste, point de rencontre des cultures de la Méditerranée.",
    monuments: [
      { name: "Phare d'Alexandrie", desc: "L'une des Sept Merveilles du monde antique, ~100m de haut. Détruit par les séismes en 1303." },
      { name: "Bibliothèque d'Alexandrie", desc: "Centre intellectuel du monde antique. Jusqu'à 500 000 rouleaux, détruite progressivement entre le IIIᵉ et le VIIᵉ siècle." },
      { name: "Catacombes de Kom el-Shoqafa", desc: "Tombe romaine taillée dans le roc, IIᵉ siècle, mêlant iconographies égyptienne, grecque et romaine." }
    ]
  },
  {
    id: 'caire',
    name: 'Le Caire',
    ancient: "Babylone d'Égypte / Fustat",
    pos: [10, 0, -68],
    era: 'Période islamique · fondé en 969',
    description: "Fondé par les Fatimides en 969 sur les ruines de la forteresse romaine de Babylone. Successeur de Memphis, voisin direct du plateau de Gizeh. Cœur politique de l'Égypte moderne.",
    monuments: [
      { name: "Mosquée d'Ibn Touloun", desc: "Plus ancienne mosquée du Caire encore intacte, 879. Architecture abbasside et minaret en spirale." },
      { name: "Citadelle de Saladin", desc: "Forteresse médiévale dominant la ville depuis le XIIᵉ siècle, sur le mont Mokattam." },
      { name: "Musée égyptien de Tahrir", desc: "170 000 pièces — dont l'intégralité du trésor de Toutânkhamon." }
    ]
  },
  {
    id: 'gizeh',
    name: 'Gizeh',
    ancient: 'Plateau de Giza',
    pos: [6, 0, -72],
    era: 'Ancien Empire · IVᵉ dynastie · ~2560 av. J.-C.',
    description: "Le complexe funéraire de la IVᵉ dynastie. Chantier monumental qui a mobilisé l'État pharaonique pendant trois générations. Aligné sur les points cardinaux avec une précision astronomique.",
    monuments: [
      { name: "Grande pyramide de Khéops", desc: "146,6m à l'origine, 138m aujourd'hui. ~2,3 millions de blocs de calcaire. Seule des Sept Merveilles encore debout." },
      { name: "Pyramide de Khéphren", desc: "143m. Conserve son revêtement de calcaire au sommet. Visuellement plus haute car bâtie sur un socle plus élevé." },
      { name: "Sphinx de Gizeh", desc: "Statue colossale taillée dans le roc, 73m de long, 20m de haut. Sans doute à l'effigie de Khéphren." }
    ]
  },
  {
    id: 'saqqara',
    name: 'Saqqara',
    ancient: 'Nécropole de Memphis',
    pos: [12, 0, -62],
    era: 'IIIᵉ dynastie · ~2670 av. J.-C.',
    description: "La nécropole millénaire de la capitale Memphis. Saqqara raconte 3000 ans d'histoire funéraire — depuis la première pyramide d'Imhotep jusqu'aux tombes ptolémaïques et coptes.",
    monuments: [
      { name: "Pyramide à degrés de Djoser", desc: "Première pyramide d'Égypte, 60m. Conçue par Imhotep — premier architecte connu de l'histoire." },
      { name: "Sérapéum", desc: "Catacombes des taureaux Apis avec sarcophages de granit de 70 tonnes." },
      { name: "Mastabas des Anciens Royaumes", desc: "Tombes de hauts fonctionnaires aux reliefs peints d'une rare précision." }
    ]
  },
  {
    id: 'abydos',
    name: 'Abydos',
    ancient: 'Abdjou',
    pos: [16, 0, 14],
    era: "Toutes périodes · centre du culte d'Osiris",
    description: "Le sanctuaire d'Osiris, dieu des morts. Pèlerinage obligatoire pour tout Égyptien lettré. Lieu de la légende de la résurrection — où les fragments d'Osiris auraient été rassemblés.",
    monuments: [
      { name: "Temple de Séthi Iᵉʳ", desc: "Reliefs polychromes parmi les mieux conservés d'Égypte. Plafond astronomique d'une finesse exceptionnelle." },
      { name: "Liste royale d'Abydos", desc: "76 cartouches des pharaons légitimes selon Séthi Iᵉʳ — exclut les hérétiques et les femmes pharaons." },
      { name: "Osireion", desc: "Cénotaphe symbolique d'Osiris. Architecture mégalithique débattue." }
    ]
  },
  {
    id: 'louxor',
    name: 'Louxor',
    ancient: 'Thèbes / Ouaset',
    pos: [22, 0, 28],
    era: 'Nouvel Empire · XVIIIᵉ-XXᵉ dynastie',
    description: "Capitale du Nouvel Empire, cœur religieux de l'Égypte ancienne. Thèbes a régné sur 1500 ans d'histoire pharaonique — la ville d'Amon, la rive des morts, la rive des vivants.",
    monuments: [
      { name: "Karnak", desc: "Plus grand complexe religieux jamais construit, 30 hectares. Salle hypostyle de 134 colonnes — certaines de 23m." },
      { name: "Vallée des Rois", desc: "63 tombes royales — Toutânkhamon, Ramsès II, Séthi Iᵉʳ, Hatchepsout." },
      { name: "Temple de Louxor", desc: "Relié à Karnak par l'allée des sphinx (3km). Restauration achevée en 2021." }
    ]
  },
  {
    id: 'assouan',
    name: 'Assouan',
    ancient: 'Souenet / Yebou',
    pos: [26, 0, 60],
    era: 'Toutes périodes · frontière sud',
    description: "Frontière sud de l'Égypte historique. Premier cataracte du Nil — verrou commercial et militaire. Carrière du granite rose des obélisques pharaoniques.",
    monuments: [
      { name: "Temple de Philae", desc: "Sanctuaire d'Isis. Démonté pierre par pierre dans les années 1970 et remonté sur l'île d'Aguilkia." },
      { name: "Obélisque inachevé", desc: "Bloc de granite de 1200 tonnes encore dans la carrière — aurait été le plus grand jamais taillé, 42m." },
      { name: "Île d'Éléphantine", desc: "Poste-frontière depuis l'Ancien Empire. Temple de Khnoum, dieu créateur des hommes." }
    ]
  },
  {
    id: 'abu-simbel',
    name: 'Abou Simbel',
    ancient: 'Temple de Ramsès II',
    pos: [14, 0, 92],
    era: 'Nouvel Empire · ~1264 av. J.-C.',
    description: "Le manifeste politique de Ramsès II en Nubie. Aligné astronomiquement : le soleil pénètre le sanctuaire et illumine la statue du pharaon deux fois par an, le 22 février et le 22 octobre.",
    monuments: [
      { name: "Grand temple de Ramsès II", desc: "Quatre colosses assis de 20m de haut taillés dans la falaise. Façade orientée vers le soleil levant." },
      { name: "Petit temple de Néfertari", desc: "Six colosses de 10m, dont quatre représentent Ramsès et deux Néfertari — hommage exceptionnel." },
      { name: "Sauvetage UNESCO (1968)", desc: "Démonté en 1036 blocs et remonté 65m plus haut pour échapper au lac Nasser." }
    ]
  }
];
