# Sources pour la base de données historique — Kemet

Règle n°1 : **ne copie jamais Wikipédia, ne laisse jamais une IA rédiger un article pour toi sans réécriture complète.** Google détecte les deux en 2026, et ton positionnement "média de niche pour passionnés" meurt à la première sanction. Les sources ci-dessous servent à **te nourrir**, pas à être recopiées.

## Tier 1 — Sources académiques open-access (à citer, à lire en profondeur)

Ce sont les sources qui vont donner à ton site la crédibilité qu'un blog ne peut pas avoir. Si tu cites BIFAO dans un article, tu n'es plus "un mec qui aime l'Égypte", tu es quelqu'un qui lit les sources.

| Source | URL | Ce que tu y trouves |
|---|---|---|
| **BIFAO** (Bulletin de l'Institut Français d'Archéologie Orientale) | https://www.ifao.egnet.net/bifao/ | Articles universitaires en français, téléchargement libre des numéros > 5 ans. Référence absolue en égyptologie francophone. |
| **ENiM** (Égypte Nilotique et Méditerranéenne) | https://www.enim-egyptologie.fr/ | Revue française open access, articles courts, très exploitable. |
| **JEA** (Journal of Egyptian Archaeology) | https://www.ees.ac.uk/journal-of-egyptian-archaeology | Numéros anciens en open access via JSTOR. |
| **CdE** (Chronique d'Égypte) | https://www.brepols.net/series/cde | Mixte payant / open access. |
| **TLA — Thesaurus Linguae Aegyptiae** (Berlin) | https://thesaurus-linguae-aegyptiae.de/ | Corpus des textes égyptiens avec traductions. Pour les articles "qu'est-ce que dit vraiment l'inscription". |
| **Persée** | https://www.persee.fr/ | Archives complètes de revues françaises d'histoire. Cherche "Égypte ancienne". |
| **Open Edition Journals** | https://journals.openedition.org/ | Revues françaises en SHS, plusieurs dédiées à l'antiquité. |
| **Academia.edu** | https://www.academia.edu/ | Beaucoup d'égyptologues y déposent leurs papers. Crée un compte gratuit. |

## Tier 2 — Données structurées (pour remplir ta base)

Pour alimenter `data/timeline.json` et construire des fiches pharaons, temples, sites, tu as besoin de données déjà structurées. Ne retape pas ce qui existe.

| Source | URL | Usage |
|---|---|---|
| **Wikidata** | https://www.wikidata.org/ | THE source pour les données structurées. Exemple : [Ramsès II](https://www.wikidata.org/wiki/Q1526) a des propriétés datables, coordonnées, prédécesseurs, sources. Requêtable en SPARQL. |
| **SPARQL endpoint Wikidata** | https://query.wikidata.org/ | Récupère en une requête tous les pharaons de la XVIIIᵉ dynastie avec dates, épouses, enfants, sites funéraires. Exporte en JSON. |
| **Pelagios / Pleiades** | https://pleiades.stoa.org/ | Base de données géographique du monde antique. Coordonnées précises des sites. |
| **Trismegistos** | https://www.trismegistos.org/ | Base de données des textes et personnes de l'Égypte antique (gréco-romaine surtout). |
| **Theban Mapping Project** | https://thebanmappingproject.com/ | Plans précis de toutes les tombes de la Vallée des Rois. |
| **Digital Egypt for Universities** (UCL) | https://www.ucl.ac.uk/museums-static/digitalegypt/ | Vieille mais dense, structurée par période. Bon pour les brouillons. |

### Exemple : requête SPARQL pour ta base pharaons

Va sur https://query.wikidata.org/ et colle ça :

```sparql
SELECT ?pharaon ?pharaonLabel ?debutRegne ?finRegne ?dynastieLabel
WHERE {
  ?pharaon wdt:P39 wd:Q1139055.  # a pour poste : pharaon d'Égypte
  OPTIONAL { ?pharaon wdt:P569 ?debutRegne. }
  OPTIONAL { ?pharaon wdt:P570 ?finRegne. }
  OPTIONAL { ?pharaon wdt:P1027 ?dynastie. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
LIMIT 500
```

Tu cliques "Run", tu exportes en JSON, tu as 500 pharaons prêts à nettoyer.

## Tier 3 — Musées et collections (images libres de droits)

| Source | URL | Particularité |
|---|---|---|
| **Metropolitan Museum (NYC)** | https://www.metmuseum.org/art/collection | API ouverte, 400 000+ œuvres en domaine public. Inclut une énorme collection égyptienne. |
| **British Museum** | https://www.britishmuseum.org/collection | Collection en ligne, images en CC BY-NC-SA. |
| **Louvre** | https://collections.louvre.fr/ | Département des Antiquités égyptiennes, images libres pour usage non commercial. |
| **Musée égyptien du Caire** | — | Pas de collection en ligne exploitable. À visiter sur place si tu y vas. |
| **Rijksmuseum** | https://www.rijksmuseum.nl/en/rijksstudio | Collection égyptienne, API, domaine public. |
| **Wikimedia Commons** | https://commons.wikimedia.org/ | Photos de sites, temples, objets. Toujours vérifier la licence exacte. |

**API Met Museum exemple** :
```bash
# Liste des objets "Egyptian Art"
curl "https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=10&q=pharaoh"

# Détail d'un objet
curl "https://collectionapi.metmuseum.org/public/collection/v1/objects/544684"
```

## Tier 4 — Livres de référence (pour la profondeur éditoriale)

Tu ne peux PAS tenir un média de niche crédible sans avoir lu les basiques. Investissement : 150-200€, une fois.

- **Nicolas Grimal**, *Histoire de l'Égypte ancienne* (Fayard) — la référence francophone universitaire.
- **Pascal Vernus & Jean Yoyotte**, *Dictionnaire des pharaons* (Noêsis) — fiche par fiche.
- **Erik Hornung**, *History of Ancient Egypt* (Cornell University Press) — si tu lis l'anglais.
- **Bernadette Menu**, *Ramsès II. Souverain des souverains* (Gallimard Découvertes) — pour commencer.
- **Toby Wilkinson**, *The Rise and Fall of Ancient Egypt* — vulgarisation haut de gamme.

Ces livres te donnent la **ligne éditoriale invisible** : le bon ton, les bonnes hiérarchies de faits, les bonnes controverses à connaître.

## Tier 5 — À éviter absolument

- ❌ **Futura-Sciences, Geo, Herodote.net pour le contenu brut** → tu vas te retrouver à écrire la même chose qu'eux, mal. Lis-les pour comprendre leur angle, pas pour nourrir le tien.
- ❌ **Wikipédia comme source primaire** → utilise-le comme point de départ pour trouver les vraies sources dans sa bibliographie, jamais comme source finale.
- ❌ **Sites new-age / Bauval / pseudo-archéologie** → ça pollue ton SEO et ta crédibilité. Si ton article cite Graham Hancock, aucun passionné sérieux ne te lira.
- ❌ **Contenu 100% IA** → Google a des classifiers qui détectent la rédaction automatique. Ton site se fait déréférencer en 3 mois.

## Workflow recommandé pour un article

1. **Choisis un angle précis** (ex : "Pourquoi Akhenaton a-t-il été effacé des listes royales ?" — pas "Akhenaton").
2. **3 sources académiques minimum** : 1 de BIFAO ou ENiM, 1 livre de référence, 1 source primaire (texte traduit via TLA ou Persée).
3. **Prends des notes à la main ou sur fiche**. Ne copie-colle jamais de paragraphe.
4. **Écris le brouillon sans regarder tes notes**. Ce qui reste en mémoire = ce qui est vraiment digéré = ce qui intéresse ton lecteur.
5. **Reprends les notes pour vérifier les faits, les dates, les citations**.
6. **Cite explicitement tes sources en bas de l'article**. Ça te distingue de 95% des blogs et ça fait gagner de l'autorité.

## Licence et droits

- Texte : tout ce que tu écris est à toi. Si tu cites > 3 lignes d'un autre auteur, guillemets + source obligatoires.
- Images : domaine public (> 70 ans après mort de l'auteur, ou œuvre ancienne photographiée fidèlement) = OK. CC BY = OK avec crédit. CC BY-NC = OK tant que tu ne monétises pas. Tout le reste : demande ou paye.
- Si un jour tu monétises (pub, affiliation, produit), repasse sur toutes tes images et vire celles en CC BY-NC.
