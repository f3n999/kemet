# Kemet — Média indépendant sur l'Égypte ancienne

**Direction verrouillée : A — contenu pur, aucun voyage, aucun lead capture.**
Voir `setup/DIRECTION.md` pour le positionnement complet.

## Structure du projet

```
.
├── index.html          → Accueil (positionnement média)
├── histoire.html       → Récit chronologique long
├── chronologie.html    → Frise interactive (filtre + recherche)
├── pharaons.html       → Galerie des figures clés
├── contact.html        → Formulaire (questions, corrections, contributions)
├── 404.html            → Erreur
├── voyage.html         → Redirection vers l'accueil (compat historique)
├── assets/
│   ├── css/style.css   → Design system complet
│   ├── js/main.js      → Nav, frise, recherche, formulaire
│   └── img/            → À remplir (images libres de droits)
├── data/
│   └── timeline.json   → Base de données des événements (32 entrées de départ)
└── setup/
    ├── DIRECTION.md    → Positionnement verrouillé (lire en premier)
    ├── VM_SETUP.md     → Mise en place machine virtuelle
    └── SOURCES.md      → Où trouver les données et les sources académiques
```

## Par quoi commencer

1. Lire `setup/DIRECTION.md` — c'est la boussole. Chaque décision de contenu doit être cohérente avec ça.
2. Lire `setup/SOURCES.md` — pour comprendre où chercher quand tu écris un article.
3. Mettre en place l'environnement selon `setup/VM_SETUP.md`.
4. Lancer le site en local :
   ```bash
   cd /chemin/vers/kemet
   python3 -m http.server 8000
   ```
   Puis http://localhost:8000

## Comment enrichir la chronologie

Édite `data/timeline.json`. Chaque événement suit ce format :

```json
{
  "year": -1274,
  "displayDate": "1274 av. J.-C.",
  "period": "nouvel",
  "title": "Bataille de Qadesh",
  "description": "Ramsès II affronte les Hittites…"
}
```

Les `period` valides sont : `prehistoire`, `ancien`, `moyen`, `nouvel`, `tardif`, `greco`, `moderne`.

Règle éditoriale : chaque entrée doit être **sourçable**. Ne mets pas un événement que tu ne pourrais pas justifier auprès d'un lecteur qui demande "d'où tu sors ça ?". Garde une trace privée de la source (livre, article, Wikidata) même si elle n'apparaît pas dans le JSON.

## Cadence éditoriale cible

Cf. `setup/DIRECTION.md` section "Cadence solo réaliste" :

- 2 articles longs / mois (1500-2500 mots, sourcés)
- 1 fiche courte / semaine (figure, lieu, objet)
- 1 mise à jour chronologie / semaine

Objectif 60 jours : **8 pièces de contenu publiées à un niveau que tu assumerais devant un égyptologue.**

## Hébergement (gratuit, recommandé)

- **Cloudflare Pages** → connecte un repo GitHub, push = deploy. CDN mondial, analytics gratuits. Premier choix.
- **Netlify** → alternative simple, glisse-dépose du dossier.
- **GitHub Pages** → gratuit, basique.

Pas de VPS, pas de nginx, pas de backend. Pas maintenant.

## Ce qui n'est PAS dans la v1 (volontairement)

- Pas de voyage, pas d'itinéraire, pas de capture de lead voyage. Définitivement.
- Pas d'images (à ajouter depuis Met Museum API, Wikimedia Commons, Louvre — voir `setup/SOURCES.md`).
- Pas de backend, pas de base de données serveur. Le JSON suffit jusqu'à plusieurs centaines d'entrées.
- Pas de moteur Q&A IA. La recherche lexicale sur le JSON est suffisante et honnête.
- Pas de newsletter active. À ajouter quand tu auras 10+ articles publiés, pas avant.

## Prochaines étapes (dans l'ordre)

1. Lire les 3 fichiers de `setup/` en entier.
2. Écrire le premier vrai article long (2000 mots, 3 sources citées). Sujet proposé : *"Pourquoi Akhenaton a-t-il été effacé des listes royales ?"* — c'est un angle où l'égyptologie débat encore et où tu peux te démarquer.
3. Créer un repo GitHub privé et pousser le projet.
4. Déployer sur Cloudflare Pages (10 minutes).
5. Acheter un nom de domaine (kemet.fr, kemet-media.fr, ou similaire — vérifier la disponibilité).
6. Configurer Google Search Console + sitemap.xml.
7. Écrire 7 autres articles en 60 jours.
8. **Seulement après les 8 articles**, envisager newsletter, réseaux sociaux, monétisation.

## Le test de sanité permanent

Avant de publier quoi que ce soit, pose-toi la question :
> *"Antoine, 38 ans, ingénieur à Lyon, qui a lu Grimal et regarde Arte, lirait-il ça jusqu'au bout ?"*

Si la réponse est non, ne publie pas. Réécris.
