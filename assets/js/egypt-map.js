/* =========================================================
   KEMET — egypt-map.js  (3D, Three.js + React UMD)
   Carte 3D interactive de l'Égypte ancienne.
   Stack : Three.js (ES module) + React 18 (UMD global) + htm.
   ========================================================= */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ────────────────────────────────────────────────
   ATTENTE DES GLOBALS REACT (chargés en defer)
   ──────────────────────────────────────────────── */
async function waitForGlobals() {
  if (window.React && window.ReactDOM && window.htm) return;
  await new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.React && window.ReactDOM && window.htm) return resolve();
      if (Date.now() - start > 6000) return reject(new Error('React globals timeout'));
      setTimeout(tick, 40);
    };
    tick();
  });
}

try {
  await waitForGlobals();
} catch (err) {
  console.error('[egypt-map]', err.message);
  throw err;
}

const { useState, useRef, useEffect } = window.React;
const html = window.htm.bind(window.React.createElement);

/* ────────────────────────────────────────────────
   DONNÉES VILLES — coordonnées 3D (x = E/O, z = S/N)
   Convention : nord = -z, sud = +z
   ──────────────────────────────────────────────── */
const CITIES = [
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
    era: 'Toutes périodes · centre du culte d\'Osiris',
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

/* ────────────────────────────────────────────────
   SCÈNE 3D
   ──────────────────────────────────────────────── */
class EgyptScene {
  constructor(container, onCityClick) {
    this.container = container;
    this.onCityClick = onCityClick;
    this.selectedId = null;
    this.cityNodes = [];
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-10, -10);
    this.userInteracted = false;

    this._initRenderer();
    this._initScene();
    this._buildScene();
    this._bindEvents();
    this._animate();
  }

  _initRenderer() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 620;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);
  }

  _initScene() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 620;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e0a07);
    this.scene.fog = new THREE.Fog(0x0e0a07, 220, 480);

    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    this.camera.position.set(95, 105, 135);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = 70;
    this.controls.maxDistance = 280;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.addEventListener('start', () => {
      this.userInteracted = true;
      this.controls.autoRotate = false;
    });
  }

  _buildScene() {
    this._addLights();
    this._addGround();
    this._addSeas();
    this._addLand();
    this._addNile();
    this._addPyramids();
    this._addCities();
    this._addSeaLabels();
    this._addCompass();
  }

  _addLights() {
    const amb = new THREE.AmbientLight(0xfff0d4, 0.45);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(0xffd9a0, 1.5);
    sun.position.set(-90, 130, -40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 420;
    sun.shadow.camera.left = -160;
    sun.shadow.camera.right = 160;
    sun.shadow.camera.top = 160;
    sun.shadow.camera.bottom = -160;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x6b88c4, 0x4a3018, 0.35);
    this.scene.add(hemi);
  }

  _addGround() {
    // Vaste plateau désertique sombre tout autour de l'Égypte
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2d2417,
      roughness: 1.0,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  _addSeas() {
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x1a3a7a,
      emissive: 0x0c1f4d,
      emissiveIntensity: 0.25,
      roughness: 0.18,
      metalness: 0.7,
      transparent: true,
      opacity: 0.92,
    });

    // Méditerranée (nord)
    const med = new THREE.Mesh(new THREE.PlaneGeometry(420, 90), seaMat);
    med.rotation.x = -Math.PI / 2;
    med.position.set(0, -0.2, -150);
    med.receiveShadow = true;
    this.scene.add(med);

    // Mer Rouge (est)
    const red = new THREE.Mesh(new THREE.PlaneGeometry(70, 260), seaMat.clone());
    red.rotation.x = -Math.PI / 2;
    red.position.set(75, -0.2, 25);
    red.receiveShadow = true;
    this.scene.add(red);

    // Golfe de Suez (entre Égypte continentale et Sinaï)
    const suez = new THREE.Mesh(new THREE.PlaneGeometry(8, 50), seaMat.clone());
    suez.rotation.x = -Math.PI / 2;
    suez.position.set(28, -0.15, -65);
    this.scene.add(suez);
  }

  _addLand() {
    /* Forme de l'Égypte continentale (sans Sinaï).
       Convention : la shape est en (X, Y) puis rotateX(-π/2) → (X, -Z, Y).
       Donc shape.Y > 0 → world.Z < 0 (NORD). */
    const shape = new THREE.Shape();
    // NW corner
    shape.moveTo(-32, 88);
    // North coast — delta avec indentations
    shape.lineTo(-22, 92);
    shape.bezierCurveTo(-18, 100, -12, 100, -8, 95);
    shape.bezierCurveTo(-4, 102, 2, 102, 6, 95);
    shape.bezierCurveTo(10, 100, 14, 100, 18, 92);
    shape.lineTo(24, 88);
    // Ouest du golfe de Suez (côte est de l'Égypte continentale, partie haute)
    shape.lineTo(24, 82);
    shape.lineTo(22, 70);
    // Côte de la Mer Rouge — courbée vers le sud-est
    shape.bezierCurveTo(28, 40, 30, 0, 30, -40);
    shape.bezierCurveTo(30, -70, 30, -90, 30, -100);
    // South border
    shape.lineTo(-32, -100);
    // West border (Libye)
    shape.lineTo(-32, 88);

    const extrudeSettings = {
      depth: 5,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.6,
      bevelSegments: 2,
      curveSegments: 32,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(-Math.PI / 2);

    // Texture sable procédurale
    const sandTex = this._makeSandTexture();
    sandTex.wrapS = sandTex.wrapT = THREE.RepeatWrapping;
    sandTex.repeat.set(4, 6);

    const landMat = new THREE.MeshStandardMaterial({
      color: 0xd9bc8a,
      roughness: 0.95,
      metalness: 0.0,
      map: sandTex,
    });
    const land = new THREE.Mesh(geom, landMat);
    land.receiveShadow = true;
    land.castShadow = true;
    this.scene.add(land);

    /* Sinaï — péninsule séparée par le golfe de Suez */
    const sinai = new THREE.Shape();
    sinai.moveTo(36, 88);
    sinai.lineTo(40, 100);
    sinai.lineTo(58, 90);
    sinai.lineTo(64, 70);
    sinai.lineTo(54, 50);
    sinai.lineTo(40, 55);
    sinai.lineTo(36, 70);
    sinai.lineTo(36, 88);

    const sinaiGeom = new THREE.ExtrudeGeometry(sinai, extrudeSettings);
    sinaiGeom.rotateX(-Math.PI / 2);
    const sinaiMesh = new THREE.Mesh(sinaiGeom, landMat.clone());
    sinaiMesh.receiveShadow = true;
    sinaiMesh.castShadow = true;
    this.scene.add(sinaiMesh);

    // Délimitation côtière subtile (filaire doré)
    const edgeGeom = new THREE.EdgesGeometry(geom, 18);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xc08a2e, transparent: true, opacity: 0.35 });
    const edges = new THREE.LineSegments(edgeGeom, edgeMat);
    this.scene.add(edges);
  }

  _makeSandTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    // Base
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#dcc294');
    grad.addColorStop(1, '#c0a373');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    // Grain
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 0.8 + 0.2;
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '120,90,55' : '160,130,90'},${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Quelques rides
    ctx.strokeStyle = 'rgba(110,80,50,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const y = i * 18 + Math.random() * 8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3);
      }
      ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  _addNile() {
    // Tracé du Nil — du sud (Abou Simbel) à la Méditerranée (delta)
    const points = [
      new THREE.Vector3(14, 0, 100),
      new THREE.Vector3(20, 0, 80),
      new THREE.Vector3(26, 0, 60),
      new THREE.Vector3(24, 0, 40),
      new THREE.Vector3(22, 0, 25),
      new THREE.Vector3(18, 0, 5),
      new THREE.Vector3(16, 0, -10),
      new THREE.Vector3(14, 0, -30),
      new THREE.Vector3(12, 0, -50),
      new THREE.Vector3(10, 0, -65),
      new THREE.Vector3(6, 0, -80),
      new THREE.Vector3(0, 0, -90),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 220, 1.1, 12, false);

    const waterTex = this._makeWaterTexture();
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(10, 1);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x2c6cc4,
      emissive: 0x1d4a9e,
      emissiveIntensity: 0.6,
      roughness: 0.18,
      metalness: 0.85,
      map: waterTex,
    });
    this._nileTexture = waterTex;

    const nile = new THREE.Mesh(geom, mat);
    nile.position.y = 5.2; // posé sur le dessus de la terre extrudée (depth 5 + bevel 0.6)
    nile.receiveShadow = true;
    this.scene.add(nile);

    // Halo (surface plus large, moins dense)
    const haloGeom = new THREE.TubeGeometry(curve, 220, 2.2, 8, false);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x5e9bd4,
      transparent: true,
      opacity: 0.08,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.position.y = 5.15;
    this.scene.add(halo);

    // Branches du delta (éventail)
    const deltaApex = new THREE.Vector3(0, 0, -90);
    const ends = [
      new THREE.Vector3(-18, 0, -100),
      new THREE.Vector3(-9, 0, -102),
      new THREE.Vector3(0, 0, -103),
      new THREE.Vector3(9, 0, -102),
      new THREE.Vector3(18, 0, -100),
    ];
    ends.forEach(end => {
      const branchCurve = new THREE.CatmullRomCurve3([deltaApex, end.clone().lerp(deltaApex, 0.4), end]);
      const branchGeom = new THREE.TubeGeometry(branchCurve, 30, 0.55, 8, false);
      const branch = new THREE.Mesh(branchGeom, mat.clone());
      branch.position.y = 5.2;
      this.scene.add(branch);
    });
  }

  _makeWaterTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 32;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 32);
    grad.addColorStop(0, '#1b4a9c');
    grad.addColorStop(0.5, '#2c6cc4');
    grad.addColorStop(1, '#1b4a9c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 32);
    ctx.strokeStyle = 'rgba(180,220,255,0.55)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 22, 16);
      ctx.bezierCurveTo(i * 22 + 6, 6, i * 22 + 16, 26, (i + 1) * 22, 16);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  _addPyramids() {
    const limestone = new THREE.MeshStandardMaterial({
      color: 0xd4a85a,
      roughness: 0.7,
      metalness: 0.15,
    });
    const limestoneAged = new THREE.MeshStandardMaterial({
      color: 0xb88a48,
      roughness: 0.85,
      metalness: 0.1,
    });

    const makePyramid = (x, z, height, baseHalf, mat) => {
      const geom = new THREE.ConeGeometry(baseHalf, height, 4);
      // Faire pointer une face (et non un coin) vers le sud
      geom.rotateY(Math.PI / 4);
      const m = new THREE.Mesh(geom, mat);
      m.position.set(x, 5 + height / 2, z); // sur le dessus du terrain (~y=5)
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // Gizeh : Khéops, Khéphren, Mykérinos
    const gizaX = 6, gizaZ = -72;
    this.scene.add(makePyramid(gizaX,       gizaZ,       9.5, 6.5, limestone));      // Khéops
    this.scene.add(makePyramid(gizaX - 4.5, gizaZ + 4,   8.6, 5.8, limestoneAged));  // Khéphren
    this.scene.add(makePyramid(gizaX - 8,   gizaZ + 7,   4.2, 3.0, limestoneAged));  // Mykérinos

    // Petit sphinx (boîte allongée) à l'est de Gizeh
    const sphinxBody = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xb88848, roughness: 0.85 })
    );
    sphinxBody.position.set(gizaX + 6, 6, gizaZ + 2);
    sphinxBody.castShadow = true;
    this.scene.add(sphinxBody);
    const sphinxHead = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.6, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xb88848, roughness: 0.85 })
    );
    sphinxHead.position.set(gizaX + 4.2, 7.5, gizaZ + 2);
    sphinxHead.castShadow = true;
    this.scene.add(sphinxHead);

    // Saqqara : pyramide à degrés de Djoser
    const saqqaraGroup = new THREE.Group();
    saqqaraGroup.position.set(12, 5, -62);
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const w = 7 - i * 0.85;
      const stepGeom = new THREE.BoxGeometry(w, 1.2, w);
      const step = new THREE.Mesh(stepGeom, limestoneAged.clone());
      step.position.y = 0.6 + i * 1.2;
      step.castShadow = true;
      step.receiveShadow = true;
      saqqaraGroup.add(step);
    }
    this.scene.add(saqqaraGroup);

    // Dahshour : pyramide rhomboïdale (bent) + pyramide rouge (un peu plus au sud)
    this.scene.add(makePyramid(13, -55, 6.2, 4.8, limestone));   // Red
    // Bent pyramid : 2 cônes empilés (angle qui change)
    const bentLow = new THREE.Mesh(
      new THREE.ConeGeometry(4.2, 3.2, 4),
      limestoneAged
    );
    bentLow.rotation.y = Math.PI / 4;
    bentLow.position.set(8, 5 + 1.6, -50);
    bentLow.castShadow = true;
    this.scene.add(bentLow);
    const bentTop = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 2.8, 4),
      limestoneAged
    );
    bentTop.rotation.y = Math.PI / 4;
    bentTop.position.set(8, 5 + 3.2 + 1.4, -50);
    bentTop.castShadow = true;
    this.scene.add(bentTop);
  }

  _addCities() {
    CITIES.forEach(city => {
      const group = new THREE.Group();
      group.position.set(city.pos[0], 5, city.pos[2]);

      // Mât doré
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 5.5, 10),
        new THREE.MeshStandardMaterial({
          color: 0xc08a2e,
          emissive: 0xc08a2e,
          emissiveIntensity: 0.4,
          roughness: 0.4,
        })
      );
      pillar.position.y = 2.75;
      pillar.castShadow = true;
      group.add(pillar);

      // Sphère cliquable
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xe3b34a,
          emissive: 0xe3b34a,
          emissiveIntensity: 0.85,
          roughness: 0.25,
          metalness: 0.6,
        })
      );
      sphere.position.y = 6.0;
      sphere.userData.cityId = city.id;
      sphere.castShadow = true;
      group.add(sphere);

      // Lumière ponctuelle au-dessus
      const point = new THREE.PointLight(0xffd070, 0.6, 18, 1.6);
      point.position.y = 6;
      group.add(point);

      // Anneau de pulsation au sol (visible quand sélectionné)
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.0, 2.6, 48),
        new THREE.MeshBasicMaterial({
          color: 0xe3b34a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -4.9;
      group.add(ring);

      // Étiquette texte (sprite)
      const label = this._makeCityLabel(city.name);
      label.position.y = 9;
      group.add(label);

      this.scene.add(group);
      this.cityNodes.push({ id: city.id, group, sphere, ring, label });
    });
  }

  _makeCityLabel(text) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.font = '700 60px "Cinzel", "Trajan Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const txt = text.toUpperCase();
    const tw = ctx.measureText(txt).width;
    const padX = 28;
    const bgW = tw + padX * 2;
    const bgH = 88;
    const bgX = (c.width - bgW) / 2;
    const bgY = (c.height - bgH) / 2;
    // Fond
    ctx.fillStyle = 'rgba(14,10,7,0.92)';
    ctx.fillRect(bgX, bgY, bgW, bgH);
    // Bordure or
    ctx.strokeStyle = '#c08a2e';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bgX, bgY, bgW, bgH);
    // Petite ligne sous le texte
    ctx.strokeStyle = '#e3b34a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.width / 2 - 24, bgY + bgH - 14);
    ctx.lineTo(c.width / 2 + 24, bgY + bgH - 14);
    ctx.stroke();
    // Texte
    ctx.fillStyle = '#e3b34a';
    ctx.fillText(txt, c.width / 2, c.height / 2 - 4);

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.anisotropy = 4;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(22, 5.5, 1);
    sprite.renderOrder = 999;
    return sprite;
  }

  _addCompass() {
    const group = new THREE.Group();
    group.position.set(-60, 0.05, 95);

    // Cercle
    const ringGeom = new THREE.RingGeometry(7.5, 8.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc08a2e,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    // Aiguille N (vers -Z)
    const needleN = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 7, 4),
      new THREE.MeshStandardMaterial({ color: 0xe3b34a, emissive: 0xc08a2e, emissiveIntensity: 0.4 })
    );
    needleN.position.set(0, 0.4, -3.5);
    needleN.rotation.x = Math.PI / 2;
    group.add(needleN);

    // Aiguille S (vers +Z)
    const needleS = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 7, 4),
      new THREE.MeshStandardMaterial({ color: 0x6b5535 })
    );
    needleS.position.set(0, 0.4, 3.5);
    needleS.rotation.x = -Math.PI / 2;
    group.add(needleS);

    // Lettre N (sprite)
    const nLabel = this._makeMiniLabel('N');
    nLabel.position.set(0, 1, -10);
    nLabel.scale.set(4, 4, 1);
    group.add(nLabel);

    this.scene.add(group);
  }

  _addSeaLabels() {
    /* Étiquettes géographiques flottantes sur les mers et la péninsule.
       Sprites billboards (face caméra) avec texte canvas.               */
    const makeLabel = (text, x, y, z, opts = {}) => {
      const {
        fontSize  = 52,
        color     = 'rgba(130, 190, 255, 0.80)',
        shadow    = true,
        scale     = [38, 9, 1],
        italic    = true,
      } = opts;

      const c   = document.createElement('canvas');
      c.width   = 512;
      c.height  = 128;
      const ctx = c.getContext('2d');

      // Fond très légèrement transparent pour la lisibilité
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 128);

      const style = italic ? `italic 600 ${fontSize}px` : `600 ${fontSize}px`;
      ctx.font = `${style} "Cinzel", "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '0.12em';

      if (shadow) {
        ctx.shadowColor   = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur    = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.fillStyle = color;
      ctx.fillText(text, 256, 64);

      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex, transparent: true, depthTest: false, depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(...scale);
      sprite.renderOrder = 997;
      return sprite;
    };

    // ── Mer Méditerranée (nord) ──────────────────────────────────
    this.scene.add(makeLabel('MER MÉDITERRANÉE', -6, 2, -155, {
      fontSize: 48,
      color:   'rgba(110, 175, 245, 0.78)',
      scale:   [60, 11, 1],
    }));

    // ── Mer Rouge (est) ──────────────────────────────────────────
    // Texte vertical — deux mots empilés
    this.scene.add(makeLabel('MER', 95, 2, 0, {
      fontSize: 42,
      color:   'rgba(110, 175, 245, 0.78)',
      scale:   [24, 9, 1],
    }));
    this.scene.add(makeLabel('ROUGE', 95, 2, 14, {
      fontSize: 42,
      color:   'rgba(110, 175, 245, 0.78)',
      scale:   [28, 9, 1],
    }));

    // ── Golfe de Suez (petit, entre Égypte et Sinaï) ─────────────
    this.scene.add(makeLabel('Golfe de Suez', 30, 1.5, -68, {
      fontSize: 26,
      color:   'rgba(110, 175, 245, 0.62)',
      scale:   [26, 5.5, 1],
      italic:  true,
    }));

    // ── Péninsule du Sinaï ───────────────────────────────────────
    this.scene.add(makeLabel('SINAÏ', 50, 2, -73, {
      fontSize: 34,
      color:   'rgba(230, 195, 130, 0.78)',
      scale:   [20, 6, 1],
      italic:  false,
    }));

    // ── Nubie (sud) ──────────────────────────────────────────────
    this.scene.add(makeLabel('NUBIE', 18, 2, 80, {
      fontSize: 30,
      color:   'rgba(230, 195, 130, 0.55)',
      scale:   [22, 6, 1],
      italic:  true,
    }));

    // ── Libye (ouest) ────────────────────────────────────────────
    this.scene.add(makeLabel('LIBYE', -58, 2, 10, {
      fontSize: 30,
      color:   'rgba(230, 195, 130, 0.48)',
      scale:   [22, 6, 1],
      italic:  true,
    }));
  }

  _makeMiniLabel(letter) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = '700 40px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e3b34a';
    ctx.fillText(letter, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  }

  _bindEvents() {
    this._onResize = () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight || 620;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this._onResize);

    this._onPointerMove = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    this._onClick = (e) => {
      this._onPointerMove(e);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const targets = this.cityNodes.map(n => n.sphere);
      const hits = this.raycaster.intersectObjects(targets, false);
      if (hits.length > 0) {
        const id = hits[0].object.userData.cityId;
        this.controls.autoRotate = false;
        this.onCityClick(id);
      }
    };
    this.renderer.domElement.addEventListener('pointermove', this._onPointerMove);
    this.renderer.domElement.addEventListener('click', this._onClick);
  }

  setSelected(id) {
    this.selectedId = id;
  }

  resetView() {
    this.userInteracted = false;
    this.controls.autoRotate = true;
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate());
    const dt = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    // Animation Nil
    if (this._nileTexture) this._nileTexture.offset.x -= dt * 0.45;

    // Hover
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = this.cityNodes.map(n => n.sphere);
    const hits = this.raycaster.intersectObjects(targets, false);
    const hoveredId = hits[0]?.object.userData.cityId || null;

    this.cityNodes.forEach(node => {
      const isSel = node.id === this.selectedId;
      const isHov = node.id === hoveredId;
      const tgt = isSel ? 1.7 : isHov ? 1.35 : 1.0;
      node.sphere.scale.lerp(new THREE.Vector3(tgt, tgt, tgt), 0.18);

      if (isSel) {
        const p = (Math.sin(t * 2.4) + 1) / 2;
        node.ring.material.opacity = 0.6 - p * 0.45;
        const s = 1 + p * 1.6;
        node.ring.scale.setScalar(s);
      } else {
        node.ring.material.opacity = Math.max(0, node.ring.material.opacity - 0.05);
      }
    });

    this.renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    this.renderer.domElement.removeEventListener('pointermove', this._onPointerMove);
    this.renderer.domElement.removeEventListener('click', this._onClick);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose?.();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
        else obj.material.dispose?.();
      }
    });
  }
}

/* ────────────────────────────────────────────────
   COMPOSANTS REACT
   ──────────────────────────────────────────────── */

function CityPanel({ city, onReset }) {
  if (!city) {
    return html`
      <aside class="city-panel city-panel-empty">
        <div>
          <div class="glyph">𓂀</div>
          <p>Cliquez sur une <strong style="color:var(--gold-bright);">sphère dorée</strong> pour découvrir ses monuments, son époque et son rôle dans l'histoire pharaonique.</p>
          <p class="map-hint-text">Glissez pour pivoter · molette pour zoomer · double-clic pour recentrer</p>
        </div>
      </aside>
    `;
  }
  return html`
    <aside class="city-panel">
      <div class="city-panel-head">
        <h3>${city.name}</h3>
        <button class="city-close" onClick=${onReset} title="Fermer / vue d'ensemble">×</button>
      </div>
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
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new EgyptScene(containerRef.current, (id) => setSelectedId(id));
    sceneRef.current = scene;
    return () => scene.dispose();
  }, []);

  useEffect(() => {
    sceneRef.current?.setSelected(selectedId);
  }, [selectedId]);

  const reset = () => {
    setSelectedId(null);
    sceneRef.current?.resetView();
  };

  const selectedCity = CITIES.find(c => c.id === selectedId) || null;

  return html`
    <div class="map-grid">
      <div class="map-3d-wrap">
        <div class="map-3d-canvas" ref=${containerRef}></div>
        <div class="map-3d-hint">𓂀 Glissez · molette = zoom · cliquez une sphère</div>
      </div>
      <${CityPanel} city=${selectedCity} onReset=${reset} />
    </div>
  `;
}

/* ────────────────────────────────────────────────
   MOUNT
   ──────────────────────────────────────────────── */
const mountPoint = document.getElementById('egypt-map-root');
if (mountPoint) {
  mountPoint.innerHTML = '';
  window.ReactDOM.createRoot(mountPoint).render(html`<${EgyptMapApp} />`);
}
