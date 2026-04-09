# Setup machine virtuelle — Kemet

Objectif : avoir un environnement de dev propre, isolé de ton OS, où tu peux casser des choses sans flinguer ta machine principale. Temps total : ~45 min la première fois.

## 1. Choisir la VM

Deux options réalistes selon ta machine :

| Ta machine | Outil recommandé | Pourquoi |
|---|---|---|
| Mac (Apple Silicon M1/M2/M3/M4) | **UTM** (gratuit) ou **Parallels** (payant, plus simple) | VirtualBox ne marche pas bien sur ARM |
| Mac Intel | **VirtualBox** (gratuit) | Standard, stable |
| Windows | **VirtualBox** (gratuit) ou **WSL2** (encore plus simple, pas de vraie VM) | WSL2 = Linux direct dans Windows, pas besoin d'ISO |
| Linux | Tu n'as pas besoin de VM. Tu es déjà sur Linux. | — |

**Recommandation honnête** : si tu es sur Windows, utilise **WSL2**. Pas de VM, pas d'ISO à télécharger, pas de RAM à allouer. Tu tapes `wsl --install` dans PowerShell et c'est fini. Le reste de ce guide s'applique pareil.

## 2. Image à installer

**Ubuntu Server 24.04 LTS** (pas la version Desktop, tu n'as pas besoin d'interface graphique pour un site statique).

Download : https://ubuntu.com/download/server

Specs minimum pour la VM :
- 2 CPU
- 2 Go RAM
- 20 Go disque
- Réseau en mode "bridge" ou "NAT avec port forwarding 8000→8000"

## 3. Première connexion + mise à jour

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git python3 python3-pip curl nano ufw
```

## 4. Récupérer le projet

Deux options :

**Option A — tu mets le projet sur GitHub (recommandé)**
```bash
cd ~
git clone https://github.com/TON-PSEUDO/kemet.git
cd kemet
```

**Option B — transfert manuel depuis ton Mac/PC**
```bash
# Depuis ton poste :
scp -r /chemin/local/kemet user@ip-de-la-vm:~/
```

## 5. Lancer le site en local

Le site est 100% statique, pas de build, pas de npm install. Un serveur HTTP suffit.

```bash
cd ~/kemet
python3 -m http.server 8000
```

Puis dans le navigateur de ton poste : `http://IP-DE-LA-VM:8000` (ou `http://localhost:8000` si tu es en WSL2 ou port forwarding).

Pour connaître l'IP de la VM :
```bash
ip addr show | grep inet
```

## 6. Édition à distance (le confort)

Tu ne veux pas éditer en `nano` dans le terminal. Installe **VS Code** sur ton poste + l'extension **Remote - SSH**. Tu te connectes à la VM et tu édites les fichiers comme s'ils étaient en local. Gain de temps énorme.

Documentation : https://code.visualstudio.com/docs/remote/ssh

## 7. Workflow git minimal

```bash
git config --global user.name "Ton Nom"
git config --global user.email "ton@email.com"

# Après chaque session de travail :
git add .
git commit -m "description courte"
git push
```

Si tu n'as pas encore de repo GitHub : crée-le vide sur github.com, puis :
```bash
git init
git remote add origin https://github.com/TON-PSEUDO/kemet.git
git branch -M main
git push -u origin main
```

## 8. Déploiement quand le site est prêt

Tu n'as PAS besoin d'un serveur pour héberger un site statique. Trois options gratuites, par ordre de simplicité :

1. **Netlify Drop** → https://app.netlify.com/drop → glisse-dépose le dossier. Site en ligne en 30 secondes. Nom de domaine personnalisé gratuit.
2. **Cloudflare Pages** → connecte ton repo GitHub, chaque push déploie automatiquement. Plus rapide que Netlify, pas de limite de bande passante.
3. **GitHub Pages** → gratuit, simple, mais plus limité.

**Recommandation** : Cloudflare Pages. Rien à administrer, déploiement automatique, CDN mondial, analytics inclus.

## 9. Ce que tu NE dois PAS faire

- Ne loue PAS un VPS (DigitalOcean, OVH, etc.). Tu paierais 5€/mois pour héberger un site qui peut être hébergé gratuitement et plus rapidement sur Cloudflare Pages.
- Ne mets PAS en place nginx/Apache en prod. Inutile pour un site statique.
- Ne code PAS de backend tant que tu n'as pas 5000 visiteurs/mois. Tu vas passer 2 mois sur de la plomberie au lieu d'écrire des articles.

## 10. Check de sanité avant de commencer à écrire

```bash
cd ~/kemet
python3 -m http.server 8000 &
curl -s http://localhost:8000/ | head -5
curl -s http://localhost:8000/data/timeline.json | python3 -m json.tool | head -20
```

Si les deux commandes renvoient du contenu, tu es prêt. Tu peux ouvrir VS Code Remote et commencer à écrire.
