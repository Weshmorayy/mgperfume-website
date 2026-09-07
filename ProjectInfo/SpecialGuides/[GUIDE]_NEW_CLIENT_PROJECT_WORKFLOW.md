# [Guide] Nouveau Projet Client : Processus de Duplication & Déploiement

Ce guide définit la **méthodologie officielle et permanente** pour créer un nouveau site client à partir du Master Website Template (`~/website-template`).

---

## ⚠️ Règle Fondamentale pour les Développeurs & Agents IA
> **NE JAMAIS écraser directement les fichiers du dossier `~/website-template` pour un projet client.**  
> Le Master Template doit toujours rester propre, réutilisable et générique. Chaque client possède **son propre dossier de projet indépendant** et **son propre dépôt GitHub / déploiement Vercel**.

---

## 📋 Procédure Standard en 5 Étapes

### Étape 1 : Dupliquer le Master Template
Depuis le répertoire racine de Termux (`~`) :

```bash
# 1. Dupliquer le template vers le nouveau dossier client (ex: queencocktails-website)
cp -r ~/website-template ~/nomduclient-website

# 2. Se positionner dans le nouveau dossier
cd ~/nomduclient-website

# 3. Réinitialiser ou mettre à jour le remote Git pour le nouveau client
git remote remove origin 2>/dev/null || true
```

---

### Étape 2 : Importer les Ressources Client
Placer les assets du client dans les dossiers dédiés de `public/images/` :
- **Logo** : `public/images/brand/logo-transparent.png`
- **Photos de réalisations / Galerie** : `public/images/projects/`
- **Photos d'équipe / Salon** : `public/images/projects/`

---

### Étape 3 : Personnaliser la Source Unique de Vérité (`src/config/site.ts`)
Modifier **uniquement** `src/config/site.ts` pour y intégrer les informations vérifiées du client :
1. **Identité & Coordonnées** : Nom, Slogan, Téléphone, WhatsApp direct, Adresse, Ville, Pays.
2. **Horaires** : Planning d'ouverture exact (`openingHours`).
3. **Prestations & Tarifs** : Catalogue de services avec descriptions, durées et prix en devise locale (ex: FCFA / XOF).
4. **Preuve Sociale & Avis** : Témoignages réels, chiffres clés (abonnés, années d'existence).
5. **SEO & OpenGraph** : Balises méta, mots-clés géolocalisés et image de partage.

---

### Étape 4 : Validation Locale & Test
Avant tout commit ou déploiement, vérifier la stabilité :

```bash
# Vérification stricte TypeScript
npm run type-check

# Démarrage du serveur local
npm run dev -p 3000
```
Ouvrir `http://localhost:3000` (ou `http://127.0.0.1:3000`) et vérifier l'affichage mobile et desktop.

---

### Étape 5 : Création du Dépôt GitHub & Déploiement Vercel

```bash
# 1. Enregistrer le premier commit client
git add .
git commit -m "feat(client): initialisation du site pour [Nom du Client]"

# 2. Créer le dépôt GitHub automatiquement et pousser le code
gh repo create nomduclient-website --public --source=. --remote=origin --push
```

**Déploiement Vercel en 1 clic :**
1. Ouvrir : `https://vercel.com/new/clone?repository-url=https://github.com/VOTRE_NOM_GITHUB/nomduclient-website`
2. Cliquer sur **Deploy**.
3. Le site est instantanément en ligne en HTTPS avec son URL mondiale (`.vercel.app`).
